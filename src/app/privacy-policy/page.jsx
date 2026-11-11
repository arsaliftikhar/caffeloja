export const metadata = {
  title: 'Privacy Policy | Caffeloja',
  description: 'Privacy Notice and Data Protection Policy for Caffeloja.',
};

const tocItems = [
  '1. WHAT INFORMATION DO WE COLLECT?',
  '2. HOW DO WE PROCESS YOUR INFORMATION?',
  '3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?',
  '4. HOW LONG DO WE KEEP YOUR INFORMATION?',
  '5. HOW DO WE KEEP YOUR INFORMATION SAFE?',
  '6. DO WE COLLECT INFORMATION FROM MINORS?',
  '7. WHAT ARE YOUR PRIVACY RIGHTS?',
  '8. CONTROLS FOR DO-NOT-TRACK FEATURES',
  '9. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?',
  '10. DO WE MAKE UPDATES TO THIS NOTICE?',
  '11. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?',
  '12. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?',
];

const dataCategories = [
  {
    category: 'A. Identifiers',
    examples: 'Contact details, such as real name, alias, postal address, telephone or mobile contact number, unique personal identifier, online identifier, Internet Protocol address, email address, and account name',
    collected: 'YES',
  },
  {
    category: 'B. Personal information as defined in the California Customer Records statute',
    examples: 'Name, contact information, education, employment, employment history, and financial information',
    collected: 'NO',
  },
  {
    category: 'C. Protected classification characteristics under state or federal law',
    examples: 'Gender, age, date of birth, race and ethnicity, national origin, marital status, and other demographic data',
    collected: 'NO',
  },
  {
    category: 'D. Commercial information',
    examples: 'Transaction information, purchase history, financial details, and payment information',
    collected: 'YES',
  },
  {
    category: 'E. Biometric information',
    examples: 'Fingerprints and voiceprints',
    collected: 'NO',
  },
  {
    category: 'F. Internet or other similar network activity',
    examples: 'Browsing history, search history, online behavior, interest data, and interactions with our and other websites, applications, systems, and advertisements',
    collected: 'NO',
  },
  {
    category: 'G. Geolocation data',
    examples: 'Device location',
    collected: 'NO',
  },
  {
    category: 'H. Audio, electronic, sensory, or similar information',
    examples: 'Images and audio, video or call recordings created in connection with our business activities',
    collected: 'NO',
  },
  {
    category: 'I. Professional or employment-related information',
    examples: 'Business contact details in order to provide you our Services at a business level or job title, work history, and professional qualifications if you apply for a job with us',
    collected: 'NO',
  },
  {
    category: 'J. Education Information',
    examples: 'Student records and directory information',
    collected: 'NO',
  },
  {
    category: 'K. Inferences drawn from collected personal information',
    examples: 'Inferences drawn from any of the collected personal information listed above to create a profile or summary about, for example, an individual’s preferences and characteristics',
    collected: 'NO',
  },
  {
    category: 'L. Sensitive personal Information',
    examples: '—',
    collected: 'NO',
  },
];

export default function PrivacyPolicyPage() {
  const sectionStyle = { marginBottom: '28px' };
  const h2Style = {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.35rem',
    color: 'var(--amber-light)',
    marginBottom: '12px',
  };
  const h3Style = {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginTop: '14px',
    marginBottom: '8px',
  };
  const pStyle = {
    color: 'var(--text-secondary)',
    lineHeight: '1.75',
    marginBottom: '12px',
    fontSize: '0.95rem',
  };

  return (
    <div style={{ paddingTop: '135px', paddingBottom: '90px', minHeight: '90vh', background: 'var(--bg-primary)' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div className="section-header" style={{ marginBottom: '44px' }}>
          <span className="section-tag">Data Protection</span>
          <h1 className="section-title">Privacy Policy</h1>
          <p className="section-desc">How we collect, store, use, and protect your personal information</p>
        </div>

        <div
          style={{
            background: '#16100c',
            border: '1px solid var(--mocha-border)',
            borderRadius: '20px',
            padding: '40px 36px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          }}
        >
          <div style={sectionStyle}>
            <p style={pStyle}>
              This Privacy Notice for caffeloja (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), describes how and why we might access, collect, store, use, and/or share (&ldquo;process&rdquo;) your personal information when you use our services (&ldquo;Services&rdquo;), including when you:
            </p>
            <ul style={{ ...pStyle, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Visit our website at http://caffeloja.com or any website of ours that links to this Privacy Notice</li>
              <li>Engage with us in other related ways, including any marketing or events</li>
            </ul>
            <p style={pStyle}>
              <strong>Questions or concerns?</strong> Reading this Privacy Notice will help you understand your privacy rights and choices. We are responsible for making decisions about how your personal information is processed. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at{' '}
              <a href="mailto:caffeloja77@gmail.com" style={{ color: 'var(--amber-light)' }}>caffeloja77@gmail.com</a>.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>SUMMARY OF KEY POINTS</h2>
            <p style={pStyle}>
              This summary provides key points from our Privacy Notice, but you can find out more details about any of these topics by using our table of contents below to find the section you are looking for.
            </p>
            <p style={pStyle}>
              <strong>What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use.
            </p>
            <p style={pStyle}>
              <strong>Do we process any sensitive personal information?</strong> Some of the information may be considered &ldquo;special&rdquo; or &ldquo;sensitive&rdquo; in certain jurisdictions, for example your racial or ethnic origins, sexual orientation, and religious beliefs. We do not process sensitive personal information.
            </p>
            <p style={pStyle}>
              <strong>Do we collect any information from third parties?</strong> We do not collect any information from third parties.
            </p>
            <p style={pStyle}>
              <strong>How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent. We process your information only when we have a valid legal reason to do so.
            </p>
            <p style={pStyle}>
              <strong>In what situations and with which parties do we share personal information?</strong> We may share information in specific situations and with specific third parties.
            </p>
            <p style={pStyle}>
              <strong>How do we keep your information safe?</strong> We have adequate organizational and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information.
            </p>
            <p style={pStyle}>
              <strong>What are your rights?</strong> Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information.
            </p>
            <p style={pStyle}>
              <strong>How do you exercise your rights?</strong> The easiest way to exercise your rights is by contacting us at caffeloja77@gmail.com. We will consider and act upon any request in accordance with applicable data protection laws.
            </p>
          </div>

          <div
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--mocha-border)',
              borderRadius: '14px',
              padding: '24px',
              marginBottom: '32px',
            }}
          >
            <h2 style={{ ...h2Style, marginBottom: '14px' }}>TABLE OF CONTENTS</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tocItems.map((item) => (
                <div key={item} style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>1. WHAT INFORMATION DO WE COLLECT?</h2>
            <h3 style={h3Style}>Personal information you disclose to us</h3>
            <p style={pStyle}>
              <em>In Short: We collect personal information that you provide to us.</em>
            </p>
            <p style={pStyle}>
              We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.
            </p>
            <p style={pStyle}>
              <strong>Personal Information Provided by You.</strong> The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:
            </p>
            <ul style={{ ...pStyle, paddingLeft: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px' }}>
              <li>names</li>
              <li>phone numbers</li>
              <li>email addresses</li>
              <li>mailing addresses</li>
              <li>usernames</li>
              <li>passwords</li>
              <li>billing addresses</li>
              <li>debit/credit card numbers</li>
              <li>contact or authentication data</li>
              <li>contact preferences</li>
            </ul>
            <p style={pStyle}>
              <strong>Sensitive Information.</strong> We do not process sensitive information.
            </p>
            <p style={pStyle}>
              <strong>Payment Data.</strong> We may collect data necessary to process your payment if you choose to make purchases, such as your payment instrument number, and the security code associated with your payment instrument. All payment data is handled and stored by Stripe. You may find their privacy notice link(s) here:{' '}
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--amber-light)' }}>
                https://stripe.com/privacy
              </a>.
            </p>
            <p style={pStyle}>
              All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>2. HOW DO WE PROCESS YOUR INFORMATION?</h2>
            <p style={pStyle}>
              <em>In Short: We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.</em>
            </p>
            <p style={pStyle}>
              We process your personal information for a variety of reasons, depending on how you interact with our Services, including:
            </p>
            <ul style={{ ...pStyle, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>To facilitate account creation and authentication and otherwise manage user accounts.</strong> We may process your information so you can create and log in to your account, as well as keep your account in working order.</li>
              <li><strong>To deliver and facilitate delivery of services to the user.</strong> We may process your information to provide you with the requested service.</li>
              <li><strong>To respond to user inquiries/offer support to users.</strong> We may process your information to respond to your inquiries and solve any potential issues you might have with the requested service.</li>
              <li><strong>To send administrative information to you.</strong> We may process your information to send you details about our products and services, changes to our terms and policies, and other similar information.</li>
              <li><strong>To fulfill and manage your orders.</strong> We may process your information to fulfill and manage your orders, payments, returns, and exchanges made through the Services.</li>
              <li><strong>To enable user-to-user communications.</strong> We may process your information if you choose to use any of our offerings that allow for communication with another user.</li>
              <li><strong>To request feedback.</strong> We may process your information when necessary to request feedback and to contact you about your use of our Services.</li>
              <li><strong>To send you marketing and promotional communications.</strong> We may process the personal information you send to us for our marketing purposes, if this is in accordance with your marketing preferences. You can opt out of our marketing emails at any time.</li>
              <li><strong>To deliver targeted advertising to you.</strong> We may process your information to develop and display personalized content and advertising tailored to your interests, location, and more.</li>
              <li><strong>To post testimonials.</strong> We post testimonials on our Services that may contain personal information.</li>
              <li><strong>To protect our Services.</strong> We may process your information as part of our efforts to keep our Services safe and secure, including fraud monitoring and prevention.</li>
              <li><strong>To evaluate and improve our Services, products, marketing, and your experience.</strong> We may process your information when we believe it is necessary to identify usage trends, determine the effectiveness of our promotional campaigns, and to evaluate and improve our Services, products, marketing, and your experience.</li>
              <li><strong>To determine the effectiveness of our marketing and promotional campaigns.</strong> We may process your information to better understand how to provide marketing and promotional campaigns that are most relevant to you.</li>
              <li><strong>To comply with our legal obligations.</strong> We may process your information to comply with our legal obligations, respond to legal requests, and exercise, establish, or defend our legal rights.</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h2>
            <p style={pStyle}>
              <em>In Short: We may share information in specific situations described in this section and/or with the following third parties.</em>
            </p>
            <p style={pStyle}>
              We may need to share your personal information in the following situations:
            </p>
            <p style={pStyle}>
              <strong>Business Transfers.</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>4. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
            <p style={pStyle}>
              <em>In Short: We keep your information for as long as necessary to fulfill the purposes outlined in this Privacy Notice unless otherwise required by law.</em>
            </p>
            <p style={pStyle}>
              We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements). No purpose in this notice will require us keeping your personal information for longer than the period of time in which users have an account with us.
            </p>
            <p style={pStyle}>
              When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>5. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2>
            <p style={pStyle}>
              <em>In Short: We aim to protect your personal information through a system of organizational and technical security measures.</em>
            </p>
            <p style={pStyle}>
              We have implemented appropriate and reasonable technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the Services within a secure environment.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>6. DO WE COLLECT INFORMATION FROM MINORS?</h2>
            <p style={pStyle}>
              <em>In Short: We do not knowingly collect data from or market to children under 18 years of age.</em>
            </p>
            <p style={pStyle}>
              We do not knowingly collect, solicit data from, or market to children under 18 years of age, nor do we knowingly sell such personal information. By using the Services, you represent that you are at least 18 or that you are the parent or guardian of such a minor and consent to such minor dependent’s use of the Services. If we learn that personal information from users less than 18 years of age has been collected, we will deactivate the account and take reasonable measures to promptly delete such data from our records. If you become aware of any data we may have collected from children under age 18, please contact us at caffeloja77@gmail.com.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>7. WHAT ARE YOUR PRIVACY RIGHTS?</h2>
            <p style={pStyle}>
              <em>In Short: You may review, change, or terminate your account at any time, depending on your country, province, or state of residence.</em>
            </p>
            <p style={pStyle}>
              <strong>Withdrawing your consent:</strong> If we are relying on your consent to process your personal information, which may be express and/or implied consent depending on the applicable law, you have the right to withdraw your consent at any time. You can withdraw your consent at any time by contacting us by using the contact details provided in the section &ldquo;HOW CAN YOU CONTACT US ABOUT THIS NOTICE?&rdquo; below.
            </p>
            <p style={pStyle}>
              <strong>Opting out of marketing and promotional communications:</strong> You can unsubscribe from our marketing and promotional communications at any time by clicking on the unsubscribe link in the emails that we send, replying &ldquo;STOP&rdquo; or &ldquo;UNSUBSCRIBE&rdquo; to the SMS messages that we send, or by contacting us using the details provided in the section &ldquo;HOW CAN YOU CONTACT US ABOUT THIS NOTICE?&rdquo; below. You will then be removed from the marketing lists. However, we may still communicate with you — for example, to send you service-related messages that are necessary for the administration and use of your account, to respond to service requests, or for other non-marketing purposes.
            </p>
            <p style={pStyle}>
              No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. Information sharing to subcontractors in support services, such as customer service, is permitted. All other use case categories exclude text messaging originator opt-in data and consent; this information will not be shared with third parties.
            </p>
            <h3 style={h3Style}>Account Information</h3>
            <p style={pStyle}>
              If you would at any time like to review or change the information in your account or terminate your account, you can log in to your account settings and update your user account. Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, we may retain some information in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our legal terms and/or comply with applicable legal requirements.
            </p>
            <p style={pStyle}>If you have questions or comments about your privacy rights, you may email us at caffeloja77@gmail.com.</p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>8. CONTROLS FOR DO-NOT-TRACK FEATURES</h2>
            <p style={pStyle}>
              Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track (&ldquo;DNT&rdquo;) feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage, no uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online. If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in a revised version of this Privacy Notice.
            </p>
            <p style={pStyle}>
              California law requires us to let you know how we respond to web browser DNT signals. Because there currently is not an industry or legal standard for recognizing or honoring DNT signals, we do not respond to them at this time.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>9. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</h2>
            <p style={pStyle}>
              <em>In Short: If you are a resident of California, Colorado, Connecticut, Delaware, Florida, Indiana, Iowa, Kentucky, Maryland, Minnesota, Montana, Nebraska, New Hampshire, New Jersey, Oregon, Rhode Island, Tennessee, Texas, Utah, or Virginia, you may have the right to request access to and receive details about the personal information we maintain about you and how we have processed it, correct inaccuracies, get a copy of, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law.</em>
            </p>
            <h3 style={h3Style}>Categories of Personal Information We Collect</h3>
            <p style={pStyle}>
              The table below shows the categories of personal information we have collected in the past twelve (12) months.
            </p>
            <div className="affiliate-table-wrap" style={{ marginBottom: '20px' }}>
              <table className="affiliate-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Examples</th>
                    <th>Collected</th>
                  </tr>
                </thead>
                <tbody>
                  {dataCategories.map((row) => (
                    <tr key={row.category}>
                      <td style={{ whiteSpace: 'normal', fontWeight: '600', color: 'var(--text-primary)' }}>{row.category}</td>
                      <td style={{ whiteSpace: 'normal', color: 'var(--text-secondary)' }}>{row.examples}</td>
                      <td style={{ fontWeight: '700', color: row.collected === 'YES' ? 'var(--amber-light)' : 'var(--text-muted)' }}>
                        {row.collected}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p style={pStyle}>
              We may also collect other personal information outside of these categories through instances where you interact with us in person, online, or by phone or mail in the context of: Receiving help through our customer support channels; Participation in customer surveys or contests; and Facilitation in the delivery of our Services and to respond to your inquiries.
            </p>
            <p style={pStyle}>
              We will use and retain the collected personal information as needed to provide the Services or for: Category A – As long as the user has an account with us; Category D – As long as the user has an account with us.
            </p>
            <p style={pStyle}>
              We have not disclosed, sold, or shared any personal information to third parties for a business or commercial purpose in the preceding twelve (12) months. We will not sell or share personal information in the future belonging to website visitors, users, and other consumers.
            </p>

            <h3 style={h3Style}>Your Rights</h3>
            <p style={pStyle}>
              You have rights under certain US state data protection laws. However, these rights are not absolute, and in certain cases, we may decline your request as permitted by law. These rights include:
            </p>
            <ul style={{ ...pStyle, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Right to know whether or not we are processing your personal data</li>
              <li>Right to access your personal data</li>
              <li>Right to correct inaccuracies in your personal data</li>
              <li>Right to request the deletion of your personal data</li>
              <li>Right to obtain a copy of the personal data you previously shared with us</li>
              <li>Right to non-discrimination for exercising your rights</li>
              <li>Right to opt out of the processing of your personal data if it is used for targeted advertising, the sale of personal data, or profiling</li>
            </ul>

            <h3 style={h3Style}>How to Exercise Your Rights & Appeals</h3>
            <p style={pStyle}>
              To exercise these rights, you can contact us at caffeloja77@gmail.com or by referring to the contact details at the bottom of this document. Under certain US state data protection laws, if we decline to take action regarding your request, you may appeal our decision by emailing us at caffeloja77@gmail.com.
            </p>

            <h3 style={h3Style}>California &ldquo;Shine The Light&rdquo; Law</h3>
            <p style={pStyle}>
              California Civil Code Section 1798.83, also known as the &ldquo;Shine The Light&rdquo; law, permits our users who are California residents to request and obtain from us, once a year and free of charge, information about categories of personal information (if any) we disclosed to third parties for direct marketing purposes and the names and addresses of all third parties with which we shared personal information in the immediately preceding calendar year.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>10. DO WE MAKE UPDATES TO THIS NOTICE?</h2>
            <p style={pStyle}>
              <em>In Short: Yes, we will update this notice as necessary to stay compliant with relevant laws.</em>
            </p>
            <p style={pStyle}>
              We may update this Privacy Notice from time to time. The updated version will be indicated by an updated &ldquo;Revised&rdquo; date at the top of this Privacy Notice. We encourage you to review this Privacy Notice frequently to be informed of how we are protecting your information.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>11. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2>
            <p style={pStyle}>
              If you have questions or comments about this notice, you may email us at caffeloja77@gmail.com or contact us by post at:
            </p>
            <div style={{ ...pStyle, background: 'rgba(230,157,69,0.08)', border: '1px solid var(--mocha-border)', borderRadius: '12px', padding: '18px' }}>
              <strong style={{ color: 'var(--text-primary)', display: 'block' }}>caffeloja</strong>
              <span>6005 Marcie St</span><br />
              <span>Metairie, LA 70003</span><br />
              <span>United States</span>
            </div>
          </div>

          <div>
            <h2 style={h2Style}>12. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</h2>
            <p style={pStyle}>
              You have the right to request access to the personal information we collect from you, details about how we have processed it, correct inaccuracies, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law. To request to review, update, or delete your personal information, please contact:{' '}
              <a href="mailto:caffeloja77@gmail.com" style={{ color: 'var(--amber-light)' }}>caffeloja77@gmail.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

