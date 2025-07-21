import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface UserAction {
  type: 'click' | 'scroll' | 'form_interaction' | 'page_view' | 'time_on_page';
  element?: string;
  page: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export const UserBehaviorTracker = () => {
  const location = useLocation();
  const pageStartTime = useRef(Date.now());
  const scrollDepth = useRef(0);
  const maxScrollDepth = useRef(0);

  useEffect(() => {
    pageStartTime.current = Date.now();
    scrollDepth.current = 0;
    maxScrollDepth.current = 0;

    // Track page view
    trackUserAction({
      type: 'page_view',
      page: location.pathname,
      timestamp: Date.now(),
      metadata: {
        referrer: document.referrer,
        userAgent: navigator.userAgent
      }
    });

    // Track clicks
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const elementInfo = {
        tagName: target.tagName,
        className: target.className,
        id: target.id,
        text: target.textContent?.slice(0, 50) || '',
        xpath: getXPath(target)
      };

      trackUserAction({
        type: 'click',
        element: `${elementInfo.tagName}${elementInfo.id ? '#' + elementInfo.id : ''}${elementInfo.className ? '.' + elementInfo.className.split(' ')[0] : ''}`,
        page: location.pathname,
        timestamp: Date.now(),
        metadata: elementInfo
      });
    };

    // Track scroll depth
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      scrollDepth.current = scrollPercent;
      
      if (scrollPercent > maxScrollDepth.current) {
        maxScrollDepth.current = scrollPercent;
        
        // Track scroll milestones
        if (scrollPercent >= 25 && scrollPercent < 50) {
          trackUserAction({
            type: 'scroll',
            page: location.pathname,
            timestamp: Date.now(),
            metadata: { depth: '25%' }
          });
        } else if (scrollPercent >= 50 && scrollPercent < 75) {
          trackUserAction({
            type: 'scroll',
            page: location.pathname,
            timestamp: Date.now(),
            metadata: { depth: '50%' }
          });
        } else if (scrollPercent >= 75 && scrollPercent < 90) {
          trackUserAction({
            type: 'scroll',
            page: location.pathname,
            timestamp: Date.now(),
            metadata: { depth: '75%' }
          });
        } else if (scrollPercent >= 90) {
          trackUserAction({
            type: 'scroll',
            page: location.pathname,
            timestamp: Date.now(),
            metadata: { depth: '90%' }
          });
        }
      }
    };

    // Track form interactions
    const handleFormInteraction = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        trackUserAction({
          type: 'form_interaction',
          element: `${target.tagName}[${(target as HTMLInputElement).type || 'text'}]`,
          page: location.pathname,
          timestamp: Date.now(),
          metadata: {
            fieldName: (target as HTMLInputElement).name || target.id,
            eventType: event.type
          }
        });
      }
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('focus', handleFormInteraction, true);
    document.addEventListener('blur', handleFormInteraction, true);

    // Track time on page when leaving
    const handleBeforeUnload = () => {
      const timeOnPage = Date.now() - pageStartTime.current;
      trackUserAction({
        type: 'time_on_page',
        page: location.pathname,
        timestamp: Date.now(),
        metadata: {
          duration: timeOnPage,
          maxScrollDepth: maxScrollDepth.current
        }
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('focus', handleFormInteraction, true);
      document.removeEventListener('blur', handleFormInteraction, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Track time on page when component unmounts
      handleBeforeUnload();
    };
  }, [location.pathname]);

  const trackUserAction = (action: UserAction) => {
    console.log('User Action:', action);
    
    // Store in local storage
    const existingData = JSON.parse(localStorage.getItem('user_behavior') || '[]');
    existingData.push(action);
    
    // Keep only last 1000 actions
    if (existingData.length > 1000) {
      existingData.splice(0, existingData.length - 1000);
    }
    
    localStorage.setItem('user_behavior', JSON.stringify(existingData));

    // Send to analytics service
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', action.type, {
        page_location: action.page,
        custom_parameter: action.metadata
      });
    }
  };

  const getXPath = (element: HTMLElement): string => {
    if (element.id) {
      return `//*[@id="${element.id}"]`;
    }
    
    const parts = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
      let nbOfPreviousSiblings = 0;
      let hasNextSiblings = false;
      let sibling = element.previousSibling;
      
      while (sibling) {
        if (sibling.nodeType !== Node.DOCUMENT_TYPE_NODE && sibling.nodeName === element.nodeName) {
          nbOfPreviousSiblings++;
        }
        sibling = sibling.previousSibling;
      }
      
      sibling = element.nextSibling;
      while (sibling) {
        if (sibling.nodeName === element.nodeName) {
          hasNextSiblings = true;
          break;
        }
        sibling = sibling.nextSibling;
      }
      
      const prefix = element.nodeName.toLowerCase();
      const nth = nbOfPreviousSiblings || hasNextSiblings ? `[${nbOfPreviousSiblings + 1}]` : '';
      parts.push(prefix + nth);
      element = element.parentNode as HTMLElement;
    }
    
    return parts.length ? '/' + parts.reverse().join('/') : '';
  };

  return null;
};
