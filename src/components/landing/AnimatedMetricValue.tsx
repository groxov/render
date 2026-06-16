import CountUp from 'react-countup';

interface AnimatedMetricValueProps {
  value: string;
  className: string;
}

export function AnimatedMetricValue({ value, className }: AnimatedMetricValueProps) {
  const match = value.match(/^(\d+)(.*)$/);

  return (
    <p className={className}>
      {match ? (
        <>
          <CountUp end={Number(match[1])} duration={1.6} enableScrollSpy scrollSpyOnce />
          {match[2]}
        </>
      ) : (
        value
      )}
    </p>
  );
}
