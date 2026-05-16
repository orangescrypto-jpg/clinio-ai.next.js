'use client';

import React from 'react';
import Link from 'next/link';

export const DisclaimerPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Back to Home</Link>

      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Disclaimer</h1>
        <p className="text-sm text-gray-400">Last updated: April 2026</p>
      </div>

      <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
        
        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl">
          <p className="font-semibold text-amber-800 text-base mb-2">⚠️ Important Notice</p>
          <p className="text-amber-700">
            Clinio AI is an educational platform designed exclusively for learning and exam preparation. 
            It is not a medical device, diagnostic tool, or healthcare service. The content provided on 
            this platform should never be used as a substitute for professional medical advice, diagnosis, 
            or treatment.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Educational Purpose Only</h2>
          <p>
            Clinio AI ("the Platform") is designed and intended solely for educational purposes. All content, 
            including but not limited to quiz questions, clinical scenarios, exam simulations, articles, 
            videos, and explanatory materials, is provided to support the learning and examination preparation 
            of nursing and medical students. The Platform is not intended to provide, and does not constitute, 
            medical advice, clinical guidance, or healthcare recommendations of any kind.
          </p>
          <p className="mt-3">
            While we strive to ensure that all content is accurate, up-to-date, and aligned with current 
            clinical guidelines and evidence-based practice, medicine and healthcare are constantly evolving 
            fields. Information that was correct at the time of publication may become outdated. Users should 
            always verify information against current authoritative sources and institutional protocols.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Not a Substitute for Professional Medical Judgment</h2>
          <p>
            The information provided on this Platform is <strong>not a substitute</strong> for the exercise 
            of professional clinical judgment by qualified healthcare professionals. Diagnosis and treatment 
            decisions should never be based solely on content from this Platform. Healthcare professionals 
            must rely on their own clinical assessment, training, experience, and knowledge of the individual 
            patient when making diagnostic or therapeutic decisions.
          </p>
          <p className="mt-3">
            Nothing on this Platform should be interpreted as establishing a healthcare provider-patient 
            relationship, and the Platform does not offer telemedicine or remote consultation services.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Accuracy of Content</h2>
          <p>
            We make reasonable efforts to ensure that the content on Clinio AI is accurate, reliable, and 
            reflects current best practices in nursing and medical education. However, we do not guarantee 
            or warrant:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li>That all content is completely free from errors, omissions, or inaccuracies.</li>
            <li>That quiz or exam questions perfectly replicate official examination formats or content.</li>
            <li>That performance on this Platform predicts or guarantees performance on actual licensing or certification examinations.</li>
            <li>That all clinical scenarios reflect every possible presentation or management approach.</li>
          </ul>
          <p className="mt-3">
            Users are encouraged to cross-reference content with official textbooks, peer-reviewed journals, 
            institutional guidelines, and examination board resources.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Examination Preparation</h2>
          <p>
            While Clinio AI includes content relevant to various nursing and medical examinations — including 
            but not limited to NCLEX, NMCN, and other professional licensing examinations — the Platform is 
            not affiliated with, endorsed by, or officially connected to any examination board, regulatory 
            body, or professional organization. Examination names and trademarks are the property of their 
            respective owners and are used for descriptive purposes only.
          </p>
          <p className="mt-3">
            Use of this Platform does not guarantee success in any examination, and users should consult 
            official examination guides, syllabi, and resources provided by the relevant examining bodies.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by applicable law, Clinio AI, its creators, contributors, and 
            affiliates shall not be held liable for any direct, indirect, incidental, consequential, special, 
            or exemplary damages arising from:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li>The use of, or inability to use, the Platform.</li>
            <li>Reliance on any information, content, or materials provided on the Platform.</li>
            <li>Clinical decisions made based on Platform content.</li>
            <li>Errors, omissions, or inaccuracies in Platform content.</li>
            <li>Technical issues, interruptions, or unavailability of the Platform.</li>
          </ul>
          <p className="mt-3">
            This limitation applies regardless of whether the alleged liability is based on contract, tort, 
            negligence, strict liability, or any other basis, even if Clinio AI has been advised of the 
            possibility of such damages.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">6. No Guarantee of Outcomes</h2>
          <p>
            Clinio AI is a study aid and learning tool. We make no representations, warranties, or guarantees 
            regarding:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li>The effectiveness of the Platform for any particular user or purpose.</li>
            <li>Improvement in academic performance or examination scores.</li>
            <li>The completeness or comprehensiveness of question banks.</li>
            <li>Uninterrupted or error-free operation of the Platform.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Third-Party Content</h2>
          <p>
            The Platform may contain links to third-party websites, embedded videos (including YouTube content), 
            or references to external resources. Clinio AI does not control, endorse, or assume responsibility 
            for the content, accuracy, or practices of any third-party websites or services. Users access 
            external links at their own risk and should review the terms and policies of those third parties.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">8. User Responsibility</h2>
          <p>
            By using Clinio AI, you acknowledge and agree that:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li>You are responsible for verifying all information before relying on it.</li>
            <li>You will not use Platform content as the sole basis for clinical decision-making.</li>
            <li>You understand the educational nature of this Platform and its limitations.</li>
            <li>If you are a healthcare professional, you will exercise independent clinical judgment in all patient care situations.</li>
            <li>If you are a student, you will use this Platform as a supplement to — not a replacement for — formal education and supervised clinical training.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Changes to This Disclaimer</h2>
          <p>
            We reserve the right to update, modify, or replace this disclaimer at any time without prior 
            notice. Changes will be effective immediately upon posting to the Platform. Your continued use 
            of Clinio AI after any modifications constitutes acceptance of the updated disclaimer. We 
            encourage users to review this page periodically.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Contact Information</h2>
          <p>
            If you have any questions, concerns, or feedback regarding this disclaimer or the Platform in 
            general, please visit our <Link href="/contact" className="text-primary-600 hover:underline">Contact page</Link>.
          </p>
        </div>

      </div>

      <div className="border-t border-gray-200 pt-8 pb-4">
        <p className="text-sm text-gray-500 text-center">
          By using Clinio AI, you acknowledge that you have read, understood, and agree to this disclaimer.
        </p>
      </div>
    </div>
  );
};
