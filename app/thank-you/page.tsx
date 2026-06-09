'use client';

import React, { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircleIcon, DocumentTextIcon } from '@heroicons/react/24/solid';

// Create a separate component that uses useSearchParams
const ThankyouContent = () => {
  const searchParams = useSearchParams();
  const downloadFilesParam = searchParams.get('download_files');

  const downloadFiles: { url: string; name: string }[] = useMemo(() => {
    try {
      return downloadFilesParam ? JSON.parse(downloadFilesParam) : [];
    } catch (error) {
      console.error('Invalid download files:', error);
      return [];
    }
  }, [downloadFilesParam]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full">
        {/* Thank You Heading */}
        <div className="flex flex-col items-center mb-6">
          <CheckCircleIcon className="h-12 w-12 text-green-500 mb-2" />
          <h1 className="text-3xl font-bold text-gray-900">Thank You!</h1>
          <p className="text-gray-600 mt-2 text-center">
            Your onboarding has been completed successfully.
          </p>
        </div>

        {/* Informational Message */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6 space-y-4 border border-gray-200">
          <p>
            Your information has been sent to the carriers. You will receive an <strong>email or text</strong> when you are <strong>Ready to Sell</strong>.
          </p>

          <p>On your first day at the office, please bring the following <strong>three documents</strong> to upload into our system:</p>

          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5 text-blue-500" />
              Driver’s license
            </li>
            <li className="flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5 text-blue-500" />
              Social Security card
            </li>
            <li className="flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5 text-blue-500" />
              Either a passport or a birth certificate
            </li>
          </ul>

          <p>These documents are required to complete your <strong>I-9</strong> and start working on the sales floor.</p>
        </div>

        {/* Download Files */}
        {downloadFiles.length > 0 ? (
          <div className="space-y-3">
            {downloadFiles.map((file, index) => (
              <a
                key={index}
                href={file.url}
                className="flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                download
                target="_blank"
                rel="noopener noreferrer"
              >
                <DocumentTextIcon className="h-5 w-5" />
                {file.name}
              </a>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-4">No downloadable files available.</p>
        )}
      </div>
    </div>
  );
};

// Fallback component to show while loading
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
      <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">Loading...</p>
    </div>
  </div>
);

const ThankyouPage = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ThankyouContent />
    </Suspense>
  );
};

export default ThankyouPage;
