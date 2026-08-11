/* ==========================================================
   KOKO — All Content Data
   Single source of truth for letters, responses, reasons, etc.
   ========================================================== */

export interface Letter {
  id: string;
  label: string;
  hint: string;
  body: string;
  date: string;
}

export interface NeedMeResponse {
  id: string;
  emoji: string;
  label: string;
  response: string;
}

export interface LoveReason {
  id: number;
  text: string;
}

export interface ComfortVideo {
  id: string;
  emoji: string;
  title: string;
  description: string;
  videoSrc: string;
  posterSrc: string;
  sizeMB: string;
}

export interface DashboardCard {
  emoji: string;
  title: string;
  description: string;
  sectionId: string;
}

// ---- Dashboard Cards ----
export const dashboardCards: DashboardCard[] = [
  {
    emoji: '💌',
    title: 'Open When Letters',
    description: 'Letters for your hardest moments — open the one that fits.',
    sectionId: 'open-when',
  },
  {
    emoji: '🎥',
    title: 'Comfort Videos',
    description: 'Familiar faces and voices when you need them most.',
    sectionId: 'comfort-videos',
  },
  {
    emoji: '📖',
    title: 'Your Journal',
    description: 'Write what you feel — it goes straight to me.',
    sectionId: 'journal',
  },
  {
    emoji: '💗',
    title: 'Why I Love You',
    description: 'A deck of reasons. There are more than I could fit.',
    sectionId: 'love-reasons',
  },
  {
    emoji: '🤗',
    title: 'When You Need Me',
    description: 'Quick comfort for specific moments.',
    sectionId: 'need-me',
  },
];

// ---- Comfort Videos ----
export const comfortVideos: ComfortVideo[] = [
  {
    id: 'didi',
    emoji: '👩',
    title: 'From Didi',
    description: 'A message from your sister, always there for you.',
    videoSrc: '/videos/didi.mp4',
    posterSrc: '/images/didi-poster.jpg',
    sizeMB: '1',
  },
  {
    id: 'papa',
    emoji: '👨',
    title: 'From Papa',
    description: 'Papa\'s voice — for when you need to hear it.',
    videoSrc: '/videos/papa.mp4',
    posterSrc: '/images/papa-poster.jpg',
    sizeMB: '15',
  },
];

// ---- Open When Letters ----
export const letters: Letter[] = [
  {
    id: 'miss-me',
    label: 'Open when you miss me',
    hint: 'For the ache that comes in quiet moments',
    body: `Hey you,

I know this distance feels impossible sometimes. I know there are moments when you reach for me and I'm not there, and it hurts in a way that words can barely hold.

But here's what I need you to remember: I'm never really gone. I'm in every song that reminds you of us, every inside joke that makes you laugh alone, every night sky you look up at knowing I'm somewhere under the same one.

Missing someone this much? It only means you love them that deeply. And I love you right back — every second, across every mile.

Close your eyes. Breathe. I'm right there.

Always yours.`,
    date: 'Written with love',
  },
  {
    id: 'cant-sleep',
    label: 'Open when you can\'t sleep',
    hint: 'For those 3am thoughts that won\'t quiet down',
    body: `Hey, night owl.

I know your brain is doing that thing again — the one where it replays everything and invents new worries just for fun. I wish I could be there to hold you until it stops.

Since I can't: put your phone down after reading this. Seriously. Pull the covers up, close your eyes, and imagine I'm right there behind you, arm around your waist, breathing slowly.

Match your breathing to mine. In for four. Hold for four. Out for four.

You're safe. You're loved. Tomorrow is a fresh start, and tonight is just tonight.

Sleep, baby. I've got you.`,
    date: 'Written with love',
  },
  {
    id: 'angry-at-me',
    label: 'Open when you\'re angry at me',
    hint: 'For when I\'ve messed up and you need to hear this',
    body: `Hey,

If you're reading this, I probably did something stupid. I'm sorry — genuinely, deeply sorry. Not the kind of sorry that's just trying to end the fight, but the kind that sits with what I did wrong and wants to be better.

You have every right to be mad. Your feelings are valid, always. I never want you to swallow your anger just to keep the peace.

But when you're ready — not now, not until you're ready — I want you to know: I'm not going anywhere. We'll talk it through. I'll listen. Really listen.

You matter more to me than being right ever could.

I love you, even when we're fighting. Especially then.`,
    date: 'Written with love',
  },
  {
    id: 'feel-alone',
    label: 'Open when you feel alone',
    hint: 'For when the world feels too big and too empty',
    body: `Kriti,

Loneliness is a liar. It tells you nobody cares, nobody notices, nobody would miss you. It's wrong about all of it.

You are so deeply woven into people's lives — into my life — that your absence would leave a hole nothing else could fill. You're not alone. You're loved by people who think about you more than you realize.

And me? I think about you constantly. What you're doing, how you're feeling, whether you've eaten, whether you smiled today.

Right now, wherever you are, someone in this world loves you so fiercely it could light up a whole city.

That someone is me.`,
    date: 'Written with love',
  },
  {
    id: 'need-motivation',
    label: 'Open when you need motivation',
    hint: 'For when the mountain feels too high',
    body: `Listen to me.

You are not lazy. You are not falling behind. You are not a failure. You're a human being who got tired, and tired people need rest, not guilt.

But when you're rested? You're unstoppable. I've seen you do things that amazed me — things you probably don't even remember because you're too busy being hard on yourself.

So here's what I need you to do: pick one thing. Not everything. One small thing. Do it. Then pick another. That's how mountains get climbed — not in one leap, but step by step.

And if you fall? I'll be at the bottom with water and snacks, cheering you on.

You've got this. I believe in you more than you believe in yourself, and that's saying something.`,
    date: 'Written with love',
  },
  {
    id: 'feel-ugly',
    label: 'Open when you feel ugly',
    hint: 'For when the mirror isn\'t being kind',
    body: `Stop.

I know exactly what you're doing — picking yourself apart in front of a mirror or a camera, cataloging every flaw like it means something. It doesn't.

You want to know what I see when I look at you? I see the person whose laugh makes my whole day better. I see eyes that light up when you talk about something you love. I see a face I want to wake up next to for the rest of my life.

Beauty isn't what magazines sell. It's you, sleepy in the morning with messy hair. It's you, concentrating so hard you forget to blink. It's you, right now, exactly as you are.

You're beautiful, Kriti. Not despite your "flaws" — with them, because of them, all of it.`,
    date: 'Written with love',
  },
  {
    id: 'need-laugh',
    label: 'Open when you need a laugh',
    hint: 'For when everything is too serious',
    body: `Okay, emergency humor protocol activated:

Remember that time I tried to cook for you and set off the smoke alarm? And then tried to fan it with a towel and knocked the plant off the shelf? And you just stood there filming instead of helping?

That's us. That's always going to be us — a beautiful disaster of love and chaos and laughter.

Here's a deal: whatever's making you sad right now, it's temporary. But me making a fool of myself to make you smile? That's permanent. That's a feature, not a bug.

Now go look in the mirror and make the silliest face you can. I dare you. You won't be able to stay sad after that.

Love you, weirdo. 🤪`,
    date: 'Written with love',
  },
  {
    id: 'overwhelmed',
    label: 'Open when you\'re overwhelmed',
    hint: 'For when everything is too much at once',
    body: `Breathe.

I know it feels like everything is happening at once and nothing is going right and there aren't enough hours and you're not enough. I know that feeling. I've been there.

Here's what I wish someone had told me: you don't have to carry everything at once. Put it down. All of it. Just for five minutes. The world won't end.

Now: what's the one thing that actually matters today? Not the ten things your brain says are urgent — the one thing that genuinely matters. Do that. Let the rest wait.

And if nothing gets done today? That's okay too. You are not your productivity. You are not your to-do list. You are a person, and you're allowed to have hard days.

I love you on your hard days just as much as your easy ones.`,
    date: 'Written with love',
  },
  {
    id: 'miss-home',
    label: 'Open when you miss home',
    hint: 'For when nowhere feels like where you belong',
    body: `I know that ache.

Home isn't just a place — it's a feeling. It's the smell of your mom's cooking, the sound of your family talking over each other, the comfort of knowing exactly where everything is.

And right now, you're far from all of that, and it hurts.

But here's something I want you to hold onto: you carry home inside you. In your memories, in your voice when you call your family, in the way you make any room warmer just by being in it.

And one day — sooner than you think — you'll be back. And everything will be exactly where you left it, waiting for you.

Until then, you have me. I'm not home, but I'm trying my best to be the next closest thing.`,
    date: 'Written with love',
  },
  {
    id: 'just-because',
    label: 'Open just because',
    hint: 'No reason needed — this one\'s just for you',
    body: `Hey Kriti,

No special occasion. No crisis. No reason at all, really.

I just wanted to tell you that I love you. Right now, this second, wherever you are and whatever you're doing. I love you.

I love the way you care about people so deeply it keeps you up at night. I love your stubbornness, your curiosity, your terrible jokes that somehow always make me laugh. I love that you're reading this right now.

Some days love is grand gestures and romantic speeches. But most days, it's this — a quiet, steady, "I'm here. I see you. You matter to me."

You matter to me, Kriti. More than I'll ever be able to say.

Forever and then some. 💗`,
    date: 'Written with love',
  },
];

// ---- When You Need Me ----
export const needMeResponses: NeedMeResponse[] = [
  {
    id: 'hug',
    emoji: '🤗',
    label: 'I need a hug',
    response: 'Close your eyes. Wrap your arms around yourself and squeeze. That\'s me, reaching across whatever distance is between us, holding you tight. I\'m not letting go until you\'re ready.',
  },
  {
    id: 'hear-voice',
    emoji: '📞',
    label: 'I need to hear your voice',
    response: 'Call me. I don\'t care what time it is, what I\'m doing, or how trivial you think the reason is. Your voice is my favorite sound, and if hearing mine helps even a little, I\'m already picking up.',
  },
  {
    id: 'be-distracted',
    emoji: '🎮',
    label: 'I need to be distracted',
    response: 'Let\'s do something dumb together. Video call me and we\'ll watch something terrible, play a game, or just sit together in comfortable silence. Sometimes the best cure for heavy thoughts is light company.',
  },
  {
    id: 'cry',
    emoji: '😢',
    label: 'I need to cry',
    response: 'Then cry. Don\'t hold it in, don\'t apologize for it, don\'t try to be strong right now. Crying isn\'t weakness — it\'s your heart doing maintenance. Let it out. I\'m right here, and I\'ll be right here when you\'re done.',
  },
  {
    id: 'hear-okay',
    emoji: '💪',
    label: 'I need to hear it\'ll be okay',
    response: 'It\'s going to be okay. Not because I can see the future, but because I\'ve seen you handle things you thought would break you — and you\'re still here, still standing, still fighting. Whatever this is, it doesn\'t get to win. You do.',
  },
  {
    id: 'feel-loved',
    emoji: '💗',
    label: 'I just need to feel loved',
    response: 'You are loved. Deeply, constantly, ridiculously. You are the first thing I think about in the morning and the last thought before I sleep. You are loved in your best moments and your worst ones. You are loved when you\'re shining and when you\'re struggling. There is not a version of you that I don\'t love.',
  },
];

// ---- Love Reasons ----
export const loveReasons: LoveReason[] = [
  { id: 1, text: 'Because your laugh makes every room brighter — and you don\'t even notice it happening.' },
  { id: 2, text: 'Because you care about people so deeply that it actually keeps you up at night, and that\'s the most beautiful thing about you.' },
  { id: 3, text: 'Because you make me want to be better — not for you, but because knowing you makes me realize I can be.' },
  { id: 4, text: 'Because the way you talk when you\'re excited about something is my favorite thing to listen to in the entire world.' },
  { id: 5, text: 'Because you\'re brave in ways you don\'t give yourself credit for — you keep going even when everything feels impossible.' },
  { id: 6, text: 'Because your stubbornness drives me crazy, but it\'s also the reason you never give up on anything that matters.' },
  { id: 7, text: 'Because you see the good in people even when they\'ve forgotten it\'s there.' },
  { id: 8, text: 'Because my favorite place in the world isn\'t a place — it\'s anywhere you happen to be.' },
  { id: 9, text: 'Because you sent me that song and it changed my whole day, and you do things like that without even trying.' },
  { id: 10, text: 'Because when you\'re quiet, I can tell you\'re thinking about something important, and I love that I get to ask what it is.' },
  { id: 11, text: 'Because you make ordinary moments feel like they matter — a walk, a meal, a look.' },
  { id: 12, text: 'Because I\'ve never felt more myself than when I\'m with you, and that\'s a gift I didn\'t know I needed.' },
  { id: 13, text: 'Because you worry about being enough, and the truth is you\'ve always been more than enough.' },
  { id: 14, text: 'Because loving you is the easiest and most natural thing I\'ve ever done, and I plan to keep doing it for a very long time.' },
];
