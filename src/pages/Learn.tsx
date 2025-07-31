
import React from 'react';
import { EducationalVideos } from '@/components/EducationalVideos';
import { AccessControl } from '@/components/AccessControl';

export default function Learn() {
  return (
    <AccessControl
      accessType="learning_resources"
      title="Learning Resources"
      description="Access our comprehensive library of startup education content, including video tutorials, guides, and expert insights."
    >
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto px-4 py-8">
          <EducationalVideos />
        </div>
      </div>
    </AccessControl>
  );
}
