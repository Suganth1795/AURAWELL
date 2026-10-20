import request from 'supertest';
import type { Express } from 'express';

type Res = request.Response;

/**
 * Minimal cookie-aware test client that also satisfies the double-submit CSRF
 * protection used by the API.
 */
export class TestClient {
  private cookies = new Map<string, string>();

  constructor(private readonly app: Express) {}

  private cookieHeader(): string {
    return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
  }

  private absorb(res: Res): Res {
    const setCookies = res.headers['set-cookie'] as unknown as string[] | undefined;
    for (const raw of setCookies ?? []) {
      const [pair] = raw.split(';');
      const idx = pair.indexOf('=');
      if (idx > 0) {
        const name = pair.slice(0, idx).trim();
        const value = pair.slice(idx + 1).trim();
        if (value) this.cookies.set(name, value);
        else this.cookies.delete(name);
      }
    }
    return res;
  }

  async get(path: string): Promise<Res> {
    return this.absorb(await request(this.app).get(path).set('Cookie', this.cookieHeader()));
  }

  async post(path: string, body?: unknown): Promise<Res> {
    return this.absorb(
      await request(this.app)
        .post(path)
        .set('Cookie', this.cookieHeader())
        .set('X-CSRF-Token', this.cookies.get('aurawell_csrf') ?? '')
        .send(body as object),
    );
  }

  async put(path: string, body?: unknown): Promise<Res> {
    return this.absorb(
      await request(this.app)
        .put(path)
        .set('Cookie', this.cookieHeader())
        .set('X-CSRF-Token', this.cookies.get('aurawell_csrf') ?? '')
        .send(body as object),
    );
  }

  async patch(path: string, body?: unknown): Promise<Res> {
    return this.absorb(
      await request(this.app)
        .patch(path)
        .set('Cookie', this.cookieHeader())
        .set('X-CSRF-Token', this.cookies.get('aurawell_csrf') ?? '')
        .send(body as object),
    );
  }

  /** Issues a safe request so the server issues a CSRF cookie. */
  async bootstrapCsrf(): Promise<void> {
    await this.get('/api/csrf');
  }

  getCookie(name: string): string | undefined {
    return this.cookies.get(name);
  }
}

export const adultRegistration = {
  email: 'adult@example.com',
  password: 'Wellness!42',
  displayName: 'Ada Adult',
  birthYear: 1990,
  guardianConsent: false,
  consents: { termsOfService: true, privacyPolicy: true, aiWellnessData: false },
};
