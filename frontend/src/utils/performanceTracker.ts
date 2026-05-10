import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
  apiCallDuration: number;
  cacheHitRate: number;
  totalNetworkRequests: number;
}

class PerformanceTracker {
  private startTime: number = 0;
  private metrics: Partial<PerformanceMetrics> = {};
  private apiCalls: Array<{url: string, duration: number, cached: boolean}> = [];
  
  constructor() {
    this.startTime = performance.now();
    this.initWebVitalsTracking();
  }

  private initWebVitalsTracking() {
    // Track First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = entry.startTime;
        }
      }
    });
    
    try {
      observer.observe({ entryTypes: ['paint'] });
    } catch (e) {
      console.warn('Performance Observer not supported');
    }

    // Track Largest Contentful Paint
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP tracking not supported');
    }
  }

  startPageLoad() {
    this.startTime = performance.now();
  }

  endPageLoad() {
    this.metrics.pageLoadTime = performance.now() - this.startTime;
  }

  trackApiCall(url: string, duration: number, cached: boolean = false) {
    this.apiCalls.push({ url, duration, cached });
  }

  getMetrics(): PerformanceMetrics {
    const totalApiTime = this.apiCalls.reduce((sum, call) => sum + call.duration, 0);
    const cachedCalls = this.apiCalls.filter(call => call.cached).length;
    const cacheHitRate = this.apiCalls.length > 0 ? (cachedCalls / this.apiCalls.length) * 100 : 0;

    return {
      pageLoadTime: this.metrics.pageLoadTime || performance.now() - this.startTime,
      firstContentfulPaint: this.metrics.firstContentfulPaint,
      largestContentfulPaint: this.metrics.largestContentfulPaint,
      cumulativeLayoutShift: this.metrics.cumulativeLayoutShift,
      firstInputDelay: this.metrics.firstInputDelay,
      apiCallDuration: totalApiTime,
      cacheHitRate,
      totalNetworkRequests: this.apiCalls.length
    };
  }

  logMetrics() {
    const metrics = this.getMetrics();
    console.group('🚀 Performance Metrics');
    console.log('📊 Page Load Time:', `${metrics.pageLoadTime.toFixed(2)}ms`);
    console.log('🎨 First Contentful Paint:', metrics.firstContentfulPaint ? `${metrics.firstContentfulPaint.toFixed(2)}ms` : 'N/A');
    console.log('🖼️ Largest Contentful Paint:', metrics.largestContentfulPaint ? `${metrics.largestContentfulPaint.toFixed(2)}ms` : 'N/A');
    console.log('🌐 Total API Call Time:', `${metrics.apiCallDuration.toFixed(2)}ms`);
    console.log('💾 Cache Hit Rate:', `${metrics.cacheHitRate.toFixed(1)}%`);
    console.log('📡 Total Network Requests:', metrics.totalNetworkRequests);
    console.groupEnd();

    return metrics;
  }

  // Grade performance based on Web Vitals thresholds
  getPerformanceGrade(): { grade: string; color: string; improvements: string[] } {
    const metrics = this.getMetrics();
    let score = 0;
    const improvements: string[] = [];

    // Page Load Time (custom metric)
    if (metrics.pageLoadTime < 1000) score += 25;
    else if (metrics.pageLoadTime < 2000) score += 20;
    else if (metrics.pageLoadTime < 3000) score += 15;
    else improvements.push('Reduce page load time to under 2 seconds');

    // Largest Contentful Paint
    if (metrics.largestContentfulPaint && metrics.largestContentfulPaint < 2500) score += 25;
    else if (metrics.largestContentfulPaint && metrics.largestContentfulPaint < 4000) score += 20;
    else improvements.push('Optimize LCP to under 2.5 seconds');

    // Cache Hit Rate
    if (metrics.cacheHitRate > 70) score += 25;
    else if (metrics.cacheHitRate > 50) score += 20;
    else improvements.push('Improve cache hit rate to over 70%');

    // API Performance
    if (metrics.apiCallDuration < 500) score += 25;
    else if (metrics.apiCallDuration < 1000) score += 20;
    else improvements.push('Optimize API response times');

    const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D';
    const color = score >= 80 ? 'green' : score >= 60 ? 'orange' : 'red';

    return { grade, color, improvements };
  }

  // Create a performance report card
  generateReport(): string {
    const metrics = this.getMetrics();
    const { grade, improvements } = this.getPerformanceGrade();

    return `
🎯 Performance Report Card
━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Overall Grade: ${grade}

📈 Key Metrics:
• Page Load: ${metrics.pageLoadTime.toFixed(0)}ms
• API Calls: ${metrics.apiCallDuration.toFixed(0)}ms
• Cache Hit Rate: ${metrics.cacheHitRate.toFixed(1)}%
• Network Requests: ${metrics.totalNetworkRequests}

${improvements.length > 0 ? `
🔧 Recommendations:
${improvements.map(imp => `• ${imp}`).join('\n')}
` : '✅ All metrics are performing well!'}

━━━━━━━━━━━━━━━━━━━━━━━━━
    `;
  }
}

// Hook to use performance tracking in React components
export const usePerformanceTracking = (pageName: string) => {
  const trackerRef = useRef<PerformanceTracker | null>(null);

  useEffect(() => {
    trackerRef.current = new PerformanceTracker();
    trackerRef.current.startPageLoad();

    return () => {
      if (trackerRef.current) {
        trackerRef.current.endPageLoad();
        console.log(`📊 Performance Report for ${pageName}:`);
        console.log(trackerRef.current.generateReport());
      }
    };
  }, [pageName]);

  const trackApiCall = (url: string, duration: number, cached: boolean = false) => {
    trackerRef.current?.trackApiCall(url, duration, cached);
  };

  const getMetrics = () => trackerRef.current?.getMetrics();
  const logMetrics = () => trackerRef.current?.logMetrics();

  return { trackApiCall, getMetrics, logMetrics };
};

export default PerformanceTracker;