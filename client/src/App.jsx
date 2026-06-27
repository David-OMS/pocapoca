import { useCallback, useEffect, useState } from 'react';
import GateScreen, {
  ProfileSelect,
  ImposterScreen,
  IncomingCall,
} from './components/CallScreens';
import RecorderScreen, {
  VerifyingScreen,
  TeaseScreen,
  PunchlineScreen,
} from './components/RecorderFlow';
import BirthdayScreen, { LetterOnlyScreen } from './components/BirthdayScreens';
import CakeWish, { EnjoyDayScreen } from './components/CakeWish';
import { useVoiceMeter } from './hooks/useVoiceMeter';
import { useConfettiBurst, useRingtone } from './hooks/useEffects';

const DECLINE_ROASTS = [
  'you want to decline keh',
  'whos this guy now',
  'oya answer the call 1, answer the call 2....',
];

const DECLINE_FINAL = 'werey oya click decline now';

const SCREENS = {
  LOADING: 'loading',
  PROFILES: 'profiles',
  IMPOSTER: 'imposter',
  GATE: 'gate',
  RINGING: 'ringing',
  RECORD_1: 'record1',
  VERIFY_1: 'verify1',
  TEASE_1: 'tease1',
  RECORD_2: 'record2',
  VERIFY_2: 'verify2',
  PUNCHLINE: 'punchline',
  BIRTHDAY: 'birthday',
  CAKE: 'cake',
  ENJOY: 'enjoy',
  LETTER: 'letter',
};

function randomDodgeInPhone() {
  const side = Math.random() > 0.5;
  return {
    left: side ? `${6 + Math.random() * 18}%` : `${62 + Math.random() * 18}%`,
    top: `${14 + Math.random() * 22}%`,
  };
}

export default function App() {
  const [screen, setScreen] = useState(SCREENS.LOADING);
  const [declineDodged, setDeclineDodged] = useState(false);
  const [declineStyle, setDeclineStyle] = useState({ left: '20%', top: '50%' });
  const [declineRoast, setDeclineRoast] = useState('');
  const [declineCount, setDeclineCount] = useState(0);
  const [declineGone, setDeclineGone] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const voice = useVoiceMeter();

  useEffect(() => {
    fetch('/api/wish/status')
      .then((res) => res.json())
      .then((data) => {
        setScreen(data.completed ? SCREENS.LETTER : SCREENS.PROFILES);
      })
      .catch(() => setScreen(SCREENS.PROFILES));
  }, []);

  useRingtone(screen === SCREENS.RINGING);
  useConfettiBurst(showConfetti, 2800);

  const startRinging = () => {
    setDeclineDodged(false);
    setDeclineGone(false);
    setDeclineRoast('');
    setDeclineCount(0);
    setScreen(SCREENS.RINGING);
  };

  const onDeclineAttempt = () => {
    const nextCount = declineCount + 1;
    setDeclineDodged(true);
    setDeclineCount(nextCount);

    if (nextCount >= 4) {
      setDeclineGone(true);
      setDeclineRoast(DECLINE_FINAL);
      if (navigator.vibrate) navigator.vibrate(30);
      return;
    }

    setDeclineStyle(randomDodgeInPhone());
    setDeclineRoast(DECLINE_ROASTS[nextCount - 1]);
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const runVerify = useCallback((_nextScreen, _result, attempt) => {
    setScreen(attempt === 1 ? SCREENS.VERIFY_1 : SCREENS.VERIFY_2);
    setTimeout(() => {
      if (attempt === 1) {
        setScreen(SCREENS.TEASE_1);
      } else {
        setScreen(SCREENS.PUNCHLINE);
      }
    }, 1500);
  }, []);

  const onStopRecord = (attempt) => {
    const result = voice.stop();
    runVerify(null, result, attempt);
  };

  const onContinueFromPunchline = () => {
    setShowConfetti(true);
    setScreen(SCREENS.BIRTHDAY);
  };

  const saveWish = async (wish) => {
    await fetch('/api/wish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wish }),
    });
  };

  const goToEnjoy = useCallback(() => {
    setScreen(SCREENS.ENJOY);
  }, []);

  if (screen === SCREENS.LOADING) {
    return (
      <div className="screen loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  switch (screen) {
    case SCREENS.PROFILES:
      return (
        <ProfileSelect
          onBirthdayGirl={() => setScreen(SCREENS.GATE)}
          onNotBirthdayGirl={() => setScreen(SCREENS.IMPOSTER)}
        />
      );

    case SCREENS.IMPOSTER:
      return <ImposterScreen onBack={() => setScreen(SCREENS.PROFILES)} />;

    case SCREENS.GATE:
      return <GateScreen onStart={startRinging} />;

    case SCREENS.RINGING:
      return (
        <IncomingCall
          onAccept={() => setScreen(SCREENS.RECORD_1)}
          declineDodged={declineDodged}
          declineGone={declineGone}
          declineStyle={declineStyle}
          declineRoast={declineRoast}
          onDeclineAttempt={onDeclineAttempt}
        />
      );

    case SCREENS.RECORD_1:
      return (
        <RecorderScreen
          attempt={1}
          showMicHelper
          bars={voice.bars}
          isRecording={voice.isRecording}
          durationMs={voice.durationMs}
          onStart={voice.start}
          onStop={() => onStopRecord(1)}
        />
      );

    case SCREENS.VERIFY_1:
      return <VerifyingScreen />;

    case SCREENS.TEASE_1:
      return (
        <TeaseScreen onRetry={() => setScreen(SCREENS.RECORD_2)} />
      );

    case SCREENS.RECORD_2:
      return (
        <RecorderScreen
          attempt={2}
          bars={voice.bars}
          isRecording={voice.isRecording}
          durationMs={voice.durationMs}
          onStart={voice.start}
          onStop={() => onStopRecord(2)}
        />
      );

    case SCREENS.VERIFY_2:
      return <VerifyingScreen />;

    case SCREENS.PUNCHLINE:
      return <PunchlineScreen onContinue={onContinueFromPunchline} />;

    case SCREENS.BIRTHDAY:
      return <BirthdayScreen onDone={() => setScreen(SCREENS.CAKE)} />;

    case SCREENS.CAKE:
      return <CakeWish onWishSubmit={saveWish} onComplete={goToEnjoy} />;

    case SCREENS.ENJOY:
      return <EnjoyDayScreen onBackToLetter={() => setScreen(SCREENS.LETTER)} />;

    case SCREENS.LETTER:
      return <LetterOnlyScreen />;

    default:
      return (
        <ProfileSelect
          onBirthdayGirl={() => setScreen(SCREENS.GATE)}
          onNotBirthdayGirl={() => setScreen(SCREENS.IMPOSTER)}
        />
      );
  }
}
