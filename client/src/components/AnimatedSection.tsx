import { Children, useState, useEffect } from 'react';
import { useInView } from '@/hooks/use-in-view';

// Hook to check if user prefers reduced motion - reactive with listener
function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window exists (SSR guard)
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-in-up' | 'fade-in-left' | 'fade-in-right' | 'scale-in' | 'blur-in';
  delay?: number;
}

export function AnimatedSection({ 
  children, 
  className = '', 
  animation = 'fade-in-up',
  delay = 0
}: AnimatedSectionProps) {
  const { ref, isInView, wasInitiallyVisible } = useInView<HTMLDivElement>({ 
    threshold: 0.1,
    skipInitiallyVisible: true 
  });
  const prefersReducedMotion = usePrefersReducedMotion();

  // Skip animations if user prefers reduced motion OR if element was visible on page load
  if (prefersReducedMotion || wasInitiallyVisible) {
    return <div className={className}>{children}</div>;
  }

  const animationClass = isInView ? `animate-${animation}` : 'animate-on-scroll';
  const delayStyle = delay > 0 ? { animationDelay: `${delay}ms` } : {};

  return (
    <div 
      ref={ref} 
      className={`${className} ${animationClass}`}
      style={delayStyle}
    >
      {children}
    </div>
  );
}

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
  animation?: 'fade-in-up' | 'fade-in-left' | 'fade-in-right' | 'scale-in' | 'blur-in';
  staggerDelay?: number;
}

export function AnimatedList({
  children,
  className = '',
  itemClassName = '',
  animation = 'fade-in-up',
  staggerDelay = 50
}: AnimatedListProps) {
  const { ref, isInView, wasInitiallyVisible } = useInView<HTMLDivElement>({ 
    threshold: 0.1,
    skipInitiallyVisible: true 
  });
  const prefersReducedMotion = usePrefersReducedMotion();
  
  // Normalize children to array
  const childArray = Children.toArray(children);

  // Skip animations if user prefers reduced motion OR if element was visible on page load
  if (prefersReducedMotion || wasInitiallyVisible) {
    return (
      <div className={className}>
        {childArray.map((child, index) => (
          <div key={index} className={itemClassName}>
            {child}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      {childArray.map((child, index) => (
        <div
          key={index}
          className={`${itemClassName} ${isInView ? `animate-${animation}` : 'animate-on-scroll'}`}
          style={{ 
            animationDelay: isInView ? `${index * staggerDelay}ms` : '0ms',
            willChange: 'opacity, transform'
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

interface GlowPulseProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}

export function GlowPulse({ children, className = '', active = true }: GlowPulseProps) {
  return (
    <div className={`${className} ${active ? 'animate-glow-pulse' : ''}`}>
      {children}
    </div>
  );
}

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
}

export function FloatingElement({ children, className = '' }: FloatingElementProps) {
  return (
    <div className={`${className} animate-float`}>
      {children}
    </div>
  );
}
