import React, { useState, useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';
import './App.css';

const App = () => {
  const [result, setResult] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [error, setError] = useState('');
  const [hasPermission, setHasPermission] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  // Initialize QR Scanner
  useEffect(() => {
    if (videoRef.current && isScanning) {
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          handleScanResult(result.data);
        },
        {
          onDecodeError: (err) => {
            // Ignore decode errors during scanning
            console.log('Decode error:', err);
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Use back camera on mobile
        }
      );

      scannerRef.current.start().then(() => {
        setHasPermission(true);
        setError('');
      }).catch((err) => {
        console.error('Scanner start error:', err);
        setError('Camera access denied or not available');
        setHasPermission(false);
        setIsScanning(false);
      });

      return () => {
        if (scannerRef.current) {
          scannerRef.current.stop();
          scannerRef.current.destroy();
        }
      };
    }
  }, [isScanning]);

  const handleScanResult = (data) => {
    setResult(data);
    const timestamp = new Date().toLocaleString();
    const newScan = { data, timestamp, id: Date.now() };
    
    setScanHistory(prev => [newScan, ...prev.slice(0, 9)]); // Keep last 10 scans
    
    // Stop scanning after successful scan
    setTimeout(() => {
      setIsScanning(false);
    }, 2000);
  };

  const startScanning = () => {
    setResult('');
    setError('');
    setIsScanning(true);
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (scannerRef.current) {
      scannerRef.current.stop();
    }
  };

  const clearHistory = () => {
    setScanHistory([]);
    setShowHistory(false);
  };

  const openLink = (url) => {
    try {
      // Check if it's a valid URL
      const urlPattern = /^https?:\/\//i;
      if (urlPattern.test(url)) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('Error opening URL:', err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
      console.log('Copied to clipboard');
    });
  };

  const isUrl = (str) => {
    try {
      const urlPattern = /^https?:\/\//i;
      return urlPattern.test(str);
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <svg className="w-8 h-8 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
              </svg>
              QR Scanner
            </h1>
            
            {scanHistory.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Scanner Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {!isScanning ? (
            <div className="p-8 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Ready to Scan</h2>
              <p className="text-gray-600 mb-6">Position a QR code within the camera view</p>
              <button
                onClick={startScanning}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Start Scanning
              </button>
            </div>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-80 object-cover"
                style={{ transform: 'scaleX(-1)' }} // Mirror for better UX
              />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white rounded-lg relative">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-lg"></div>
                </div>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-center">
                  <p className="text-sm">Position QR code in the frame</p>
                </div>
              </div>
              
              <button
                onClick={stopScanning}
                className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Scan Result */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-green-800">Scan Result:</h3>
              <button
                onClick={() => copyToClipboard(result)}
                className="text-green-600 hover:text-green-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </button>
            </div>
            <p className="text-green-700 text-sm break-all mb-3">{result}</p>
            
            {isUrl(result) && (
              <button
                onClick={() => openLink(result)}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Open Link
              </button>
            )}
          </div>
        )}

        {/* Scan History */}
        {showHistory && scanHistory.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Scan History</h3>
              <button
                onClick={clearHistory}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Clear
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {scanHistory.map((scan) => (
                <div key={scan.id} className="p-4 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 break-all">{scan.data}</p>
                      <p className="text-xs text-gray-500 mt-1">{scan.timestamp}</p>
                    </div>
                    <div className="flex space-x-2 ml-2">
                      <button
                        onClick={() => copyToClipboard(scan.data)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                      </button>
                      {isUrl(scan.data) && (
                        <button
                          onClick={() => openLink(scan.data)}
                          className="text-indigo-400 hover:text-indigo-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {!isScanning && !result && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">How to use:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Tap "Start Scanning" to activate the camera</li>
              <li>• Point your camera at a QR code</li>
              <li>• Make sure the QR code is within the frame</li>
              <li>• The result will appear automatically</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;