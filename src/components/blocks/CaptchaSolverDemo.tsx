import { useState, useCallback, useEffect } from 'react';
import { captchaSolver, getPerformanceMetrics } from '@/lib/captcha/high-performance-solver';
import { Zap, Clock, Database, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/store/useToastStore';

export function CaptchaSolverDemo() {
  const [isSolving, setIsSolving] = useState(false);
  const [results, setResults] = useState<Array<{
    id: number;
    question: string;
    answer: string;
    duration: number;
    cached: boolean;
    success: boolean;
  }>>([]);
  const [metrics, setMetrics] = useState({ size: 0, hitRate: 0 });
  const toast = useToast();

  useEffect(() => {
    // Update cache stats every second
    const interval = setInterval(() => {
      setMetrics(captchaSolver.getCacheStats());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const solveCaptcha = useCallback(async (question: string) => {
    setIsSolving(true);
    
    try {
      const result = await captchaSolver.solveTextCaptcha(question);
      
      setResults(prev => [{
        id: Date.now(),
        question,
        answer: result.answer || '',
        duration: result.duration,
        cached: result.cached || false,
        success: result.success
      }, ...prev].slice(0, 10));

      if (result.success) {
        toast.success(`Captcha solved in ${result.duration.toFixed(0)}ms!`);
      }
    } catch {
      toast.error('Failed to solve captcha');
    } finally {
      setIsSolving(false);
    }
  }, [toast]);

  const runBenchmark = useCallback(async () => {
    const questions = [
      'If tomorrow is Saturday, what day is today?',
      'What is 15 + 27?',
      'What is 100 - 45?',
      'What is 8 * 7?',
      'If tomorrow is Monday, what day is today?'
    ];

    toast.info('Running benchmark with 5 captchas...');
    
    for (const question of questions) {
      await solveCaptcha(question);
      await new Promise(r => setTimeout(r, 100));
    }

    toast.success('Benchmark complete!');
  }, [solveCaptcha, toast]);

  const perfMetrics = getPerformanceMetrics();

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            High-Performance Captcha Solver
          </h2>
          <p className="text-zinc-500 mt-1">
            Native CDP + Redis Cache + AI Vision
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-zinc-500">Cache Size</div>
            <div className="text-xl font-bold text-indigo-600">{metrics.size}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-zinc-500">Hit Rate</div>
            <div className="text-xl font-bold text-green-600">{(metrics.hitRate * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {/* Performance Comparison */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border border-zinc-200 rounded-lg bg-zinc-50">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-zinc-600" />
            <span className="font-semibold">Native CDP (Ultra Fast)</span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Connection:</span>
              <span className="font-mono text-green-600">{perfMetrics.nativeCDP.connection}</span>
            </div>
            <div className="flex justify-between">
              <span>Screenshot:</span>
              <span className="font-mono text-green-600">{perfMetrics.nativeCDP.screenshot}</span>
            </div>
            <div className="flex justify-between">
              <span>Navigation:</span>
              <span className="font-mono text-green-600">{perfMetrics.nativeCDP.navigation}</span>
            </div>
            <div className="flex justify-between">
              <span>Action:</span>
              <span className="font-mono text-green-600">{perfMetrics.nativeCDP.action}</span>
            </div>
            <div className="border-t pt-1 mt-1 flex justify-between font-bold">
              <span>Total:</span>
              <span className="text-green-600">{perfMetrics.nativeCDP.total}</span>
            </div>
          </div>
        </div>

        <div className="p-4 border border-zinc-200 rounded-lg bg-zinc-50">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-zinc-400" />
            <span className="font-semibold text-zinc-600">Playwright (Standard)</span>
          </div>
          <div className="space-y-1 text-sm text-zinc-600">
            <div className="flex justify-between">
              <span>Connection:</span>
              <span className="font-mono">{perfMetrics.playwright.connection}</span>
            </div>
            <div className="flex justify-between">
              <span>Screenshot:</span>
              <span className="font-mono">{perfMetrics.playwright.screenshot}</span>
            </div>
            <div className="flex justify-between">
              <span>Navigation:</span>
              <span className="font-mono">{perfMetrics.playwright.navigation}</span>
            </div>
            <div className="flex justify-between">
              <span>Action:</span>
              <span className="font-mono">{perfMetrics.playwright.action}</span>
            </div>
            <div className="border-t pt-1 mt-1 flex justify-between font-bold">
              <span>Total:</span>
              <span>{perfMetrics.playwright.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Improvement Badge */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full font-bold">
          <TrendingUp className="h-5 w-5" />
          {perfMetrics.improvement} faster than Playwright
        </div>
      </div>

      {/* Test Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => solveCaptcha('If tomorrow is Saturday, what day is today?')}
          disabled={isSolving}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          Test: Day Logic
        </button>
        
        <button
          onClick={() => solveCaptcha('What is 25 + 17?')}
          disabled={isSolving}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          Test: Math Addition
        </button>
        
        <button
          onClick={() => solveCaptcha('What is 100 - 33?')}
          disabled={isSolving}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          Test: Math Subtraction
        </button>
        
        <button
          onClick={runBenchmark}
          disabled={isSolving}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          <Zap className="h-4 w-4" />
          Run Benchmark (5x)
        </button>
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <div className="border border-zinc-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Question</th>
                <th className="px-4 py-2 text-left">Answer</th>
                <th className="px-4 py-2 text-right">Time</th>
                <th className="px-4 py-2 text-center">Cache</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.id} className="border-t">
                  <td className="px-4 py-2">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </td>
                  <td className="px-4 py-2 max-w-xs truncate">{result.question}</td>
                  <td className="px-4 py-2 font-mono">{result.answer}</td>
                  <td className="px-4 py-2 text-right">
                    <span className={result.cached ? 'text-green-600 font-bold' : ''}>
                      {result.duration.toFixed(0)}ms
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    {result.cached && (
                      <Database className="h-4 w-4 text-indigo-500 inline" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isSolving && (
        <div className="flex items-center justify-center gap-2 text-indigo-600">
          <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
          Solving with Native CDP...
        </div>
      )}
    </div>
  );
}
