import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GameShell } from '../GameShell';
import type { GameComponentProps } from '../types';

interface Step {
  text: string;
  choices: { label: string; next: string; reflection?: string }[];
}

const STORY: Record<string, Step> = {
  start: {
    text: 'It is playtime. You notice someone sitting alone by the fence, looking at the ground.',
    choices: [
      {
        label: 'Go over and say hello',
        next: 'hello',
        reflection: 'Reaching out can help someone feel included.',
      },
      { label: 'Keep playing and notice how you feel', next: 'notice' },
      {
        label: 'Invite them to join your game',
        next: 'invite',
        reflection: 'Including others is a kind, brave choice.',
      },
    ],
  },
  hello: {
    text: 'You say hello. They look up and smile a little, then say they are not sure how to join in.',
    choices: [
      {
        label: 'Show them how the game works',
        next: 'invite',
        reflection: 'Teaching a friend can make joining easier for them.',
      },
      {
        label: 'Ask what they like to play',
        next: 'invite',
        reflection: 'Asking what someone enjoys helps them feel seen.',
      },
    ],
  },
  notice: {
    text: 'You keep playing, but you keep thinking about them. You feel a little tug to check in.',
    choices: [
      {
        label: 'Follow that feeling and go say hi',
        next: 'hello',
        reflection: 'Noticing your care for others is a strength.',
      },
      {
        label: 'Seek a grown-up to help you include them',
        next: 'invite',
        reflection: 'Asking for help is a smart, kind move.',
      },
    ],
  },
  invite: {
    text: 'They join in! Partway through, they make a mistake and look embarrassed. You can choose what to do next.',
    choices: [
      {
        label: 'Say “that’s okay, mistakes happen”',
        next: 'end',
        reflection: 'Kind words help us all feel safe to try.',
      },
      {
        label: 'Gently share a tip for next time',
        next: 'end',
        reflection: 'Helping without judging keeps things friendly.',
      },
    ],
  },
  end: {
    text: 'By the end, they are laughing with you. On the way home you feel warm inside.',
    choices: [],
  },
};

export function StoryChoices({ game, onExit, onFinish }: GameComponentProps): React.JSX.Element {
  const pathLength = Number(game.settings.pathLength ?? 3);

  const [nodeId, setNodeId] = useState('start');
  const [reflections, setReflections] = useState<string[]>([]);
  const [choicesMade, setChoicesMade] = useState(0);
  const node = STORY[nodeId];
  // Only a node with no further choices ends the story — otherwise the fixed
  // `pathLength` estimate can stop the narrative at a non-terminal node.
  const finished = node.choices.length === 0;

  function choose(choice: Step['choices'][number]) {
    if (choice.reflection) setReflections((r) => [...r, choice.reflection!]);
    setChoicesMade((c) => c + 1);
    setNodeId(choice.next);
  }

  function finish() {
    onFinish({
      score: choicesMade,
      maxScore: Math.max(choicesMade, 1),
      completed: true,
      summary: { choicesMade, reflections: reflections.length },
    });
  }

  return (
    <GameShell
      title={game.title}
      roundLabel={`Choice ${choicesMade + 1}`}
      progress={Math.min(1, choicesMade / pathLength)}
      onExit={onExit}
      footer={finished ? <Button onClick={finish}>See my results</Button> : undefined}
    >
      <div className="mb-4 rounded-xl border border-border bg-card p-5 text-base leading-relaxed">
        {node.text}
      </div>

      {!finished ? (
        <div className="space-y-2" role="group" aria-label="Story choices">
          {node.choices.map((choice) => (
            <button
              key={choice.label}
              type="button"
              onClick={() => choose(choice)}
              className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
            >
              {choice.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground" role="status">
          The story found its ending. Every choice you made was yours.
        </p>
      )}

      {reflections.length > 0 ? (
        <div className="mt-5 rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            What we noticed
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {reflections.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </GameShell>
  );
}
