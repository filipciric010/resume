import React from 'react';
import { Card } from '@/components/ui/card';

export function GuidelineTips() {
  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Resume Writing Guidelines</h3>

      <section>
        <h4 className="font-medium">Keep it clear and concise</h4>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>Aim for one to two pages; focus on recent and relevant experience.</li>
          <li>Most reviewers spend ~30 seconds—optimize for clarity and scanability.</li>
        </ul>
      </section>

      <section>
        <h4 className="font-medium">Tailor your resume to the job</h4>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>Highlight experience and skills that match the job description.</li>
        </ul>
      </section>

      <section>
        <h4 className="font-medium">Essential sections</h4>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>Contact: full name, phone, professional email, location, links (LinkedIn/portfolio).</li>
          <li>Summary/Objective: brief statement aligned to the role.</li>
          <li>Skills: mix of hard and soft skills prioritized to the JD.</li>
          <li>Work Experience: reverse chronological; action verbs; quantified results.</li>
          <li>Education: concise unless early career.</li>
          <li>Optional: certifications, languages, volunteer, hobbies (if relevant).</li>
        </ul>
      </section>

      <section>
        <h4 className="font-medium">Action verbs & metrics</h4>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>Use managed, built, led, increased, optimized, delivered, etc.</li>
          <li>Quantify: “reduced costs by 15%”, “supervised 10 team members”.</li>
        </ul>
      </section>

      <section>
        <h4 className="font-medium">Proofread</h4>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>Eliminate spelling/grammar/formatting errors; get a second pair of eyes.</li>
        </ul>
      </section>

      <section>
        <h4 className="font-medium">Design</h4>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>Clean layout, readable fonts, consistent formatting.</li>
          <li>Avoid distracting graphics or colors.</li>
        </ul>
      </section>

      <section>
        <h4 className="font-medium">Be honest</h4>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>Don’t exaggerate. Focus on real impact and value.</li>
        </ul>
      </section>
    </Card>
  );
}
