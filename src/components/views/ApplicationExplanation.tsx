import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ApplicationExplanation {
  status: 'ADMITTED' | 'WAITLISTED' | 'REJECTED';
  program: string;
  decision: string;
  scoreBreakdown: {
    competencyScore: number;
    eligibilityScore: number;
    finalScore: number;
  };
  reasoning: {
    strengths: string[];
    weaknesses: string[];
    factors: string[];
  };
  nextSteps: string[];
}

export default function ApplicationExplanation() {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  const explanation: ApplicationExplanation = {
    status: 'ADMITTED',
    program: 'Bachelor of Science in Computer Science',
    decision: 'Congratulations! You have been admitted.',
    scoreBreakdown: {
      competencyScore: 82.5,
      eligibilityScore: 90,
      finalScore: 85,
    },
    reasoning: {
      strengths: [
        'Excellent technical skills score (88/100) - Above program requirements',
        'Strong problem-solving capability (86/100)',
        'Mathematics proficiency (85/100) - Key requirement met',
      ],
      weaknesses: [
        'Communication skills (72/100) - Below average but acceptable',
      ],
      factors: [
        'You met all minimum competency requirements',
        'Your overall competency score places you in the top 40% of applicants',
        'Your first-choice priority improved your ranking',
        'Balanced skill profile suitable for the program',
      ],
    },
    nextSteps: [
      'Accept or decline your admission by March 31, 2024',
      'Complete online registration and payment',
      'Attend orientation on April 15, 2024',
      'Submit required documents (birth certificate, transcripts)',
    ],
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Understanding Your Decision</h1>
        <p className="text-gray-600">Learn about your admission decision and the factors that influenced it</p>
      </div>

      {/* Status */}
      {explanation.status === 'ADMITTED' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900">Decision: ADMITTED</AlertTitle>
          <AlertDescription className="text-green-800">
            {explanation.decision}
          </AlertDescription>
        </Alert>
      )}

      {/* Score Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Your Scores</CardTitle>
          <CardDescription>Detailed breakdown of your competency assessment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Competency Score</p>
              <p className="text-3xl font-bold">{explanation.scoreBreakdown.competencyScore}</p>
              <p className="text-xs text-gray-500 mt-1">Standardized assessment</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Eligibility Score</p>
              <p className="text-3xl font-bold">{explanation.scoreBreakdown.eligibilityScore}</p>
              <p className="text-xs text-gray-500 mt-1">Met requirements</p>
            </div>
            <div className="p-4 border-2 border-blue-500 rounded-lg bg-blue-50">
              <p className="text-sm text-gray-600 mb-1">Final Score</p>
              <p className="text-3xl font-bold text-blue-600">{explanation.scoreBreakdown.finalScore}</p>
              <p className="text-xs text-gray-500 mt-1">Overall ranking</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reasoning */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {explanation.reasoning.strengths.map((strength, idx) => (
                <li key={idx} className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Areas for Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {explanation.reasoning.weaknesses.map((weakness, idx) => (
                <li key={idx} className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{weakness}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-600 mt-4">
              We recommend focusing on communication skills during your program to enhance your professional development.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Decision Factors */}
      <Card>
        <CardHeader>
          <CardTitle>Key Decision Factors</CardTitle>
          <CardDescription>What contributed to your admission decision</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {explanation.reasoning.factors.map((factor, idx) => (
              <li key={idx} className="flex gap-3 p-3 bg-gray-50 rounded">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{factor}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Competency Framework */}
      <Card>
        <CardHeader>
          <CardTitle>Competency Assessment Framework</CardTitle>
          <CardDescription>How we standardized your academic background</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Competency Mapping</h4>
            <p className="text-sm text-gray-700">
              Your REB academic background was mapped to our competency framework to ensure fair comparison with TVET applicants. Each subject was analyzed for:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
              <li>Mathematics competency</li>
              <li>Technical/practical skills</li>
              <li>Scientific reasoning</li>
              <li>Communication ability</li>
              <li>Problem-solving capability</li>
            </ul>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm mb-2">Fairness Assurance</h4>
            <p className="text-sm text-gray-700">
              This assessment was conducted without considering your gender, district of origin, or other sensitive attributes. Our system ensures fairness through algorithmic auditing and human oversight.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {explanation.nextSteps.map((step, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                  {idx + 1}
                </span>
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button className="flex-1">Accept Admission</Button>
        <Button variant="outline" className="flex-1">Defer for Next Intake</Button>
        <Button variant="outline" className="flex-1">Download Decision Letter</Button>
      </div>
    </div>
  );
}
