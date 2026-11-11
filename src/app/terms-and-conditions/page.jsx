import Link from 'next/link';

export const metadata = {
  title: 'Terms and Conditions | Caffeloja',
  description: 'Legal Terms and Conditions for Caffeloja.',
};

const tocItems = [
  '1. OUR SERVICES',
  '2. INTELLECTUAL PROPERTY RIGHTS',
  '3. USER REPRESENTATIONS',
  '4. USER REGISTRATION',
  '5. PRODUCTS',
  '6. PURCHASES AND PAYMENT',
  '7. SUBSCRIPTIONS',
  '8. RETURN POLICY',
  '9. PROHIBITED ACTIVITIES',
  '10. USER GENERATED CONTRIBUTIONS',
  '11. CONTRIBUTION LICENSE',
  '12. GUIDELINES FOR REVIEWS',
  '13. SOCIAL MEDIA',
  '14. SERVICES MANAGEMENT',
  '15. PRIVACY POLICY',
  '16. TERM AND TERMINATION',
  '17. MODIFICATIONS AND INTERRUPTIONS',
  '18. GOVERNING LAW',
  '19. DISPUTE RESOLUTION',
  '20. CORRECTIONS',
  '21. DISCLAIMER',
  '22. LIMITATIONS OF LIABILITY',
  '23. INDEMNIFICATION',
  '24. USER DATA',
  '25. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES',
  '26. SMS TEXT MESSAGING',
  '27. CALIFORNIA USERS AND RESIDENTS',
  '28. MISCELLANEOUS',
  '29. CONTACT US',
];

export default function TermsAndConditionsPage() {
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
          <span className="section-tag">Legal Information</span>
          <h1 className="section-title">Terms and Conditions</h1>
          <p className="section-desc">Agreement to Our Legal Terms</p>
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
            <h2 style={h2Style}>AGREEMENT TO OUR LEGAL TERMS</h2>
            <p style={pStyle}>
              We are caffeloja (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;), a company registered in Louisiana, United States at 6005 Marcie St, Metairie, LA 70003.
            </p>
            <p style={pStyle}>
              We operate the website http://caffeloja.com (the &ldquo;Site&rdquo;), as well as any other related products and services that refer or link to these legal terms (the &ldquo;Legal Terms&rdquo;) (collectively, the &ldquo;Services&rdquo;).
            </p>
            <p style={pStyle}>
              You can contact us by phone at (+1)5043279670, email at <a href="mailto:caffeloja77@gmail.com" style={{ color: 'var(--amber-light)' }}>caffeloja77@gmail.com</a>, or by mail to 6005 Marcie St, Metairie, LA 70003, United States.
            </p>
            <p style={pStyle}>
              These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&ldquo;you&rdquo;), and caffeloja, concerning your access to and use of the Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms. IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.
            </p>
            <p style={pStyle}>
              We will provide you with prior notice of any scheduled changes to the Services you are using. The modified Legal Terms will become effective upon posting or notifying you by caffeloja77@gmail.com, as stated in the email message. By continuing to use the Services after the effective date of any changes, you agree to be bound by the modified terms.
            </p>
            <p style={pStyle}>
              The Services are intended for users who are at least 18 years old. Persons under the age of 18 are not permitted to use or register for the Services.
            </p>
            <p style={pStyle}>We recommend that you print a copy of these Legal Terms for your records.</p>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
              {tocItems.map((item) => (
                <div key={item} style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>1. OUR SERVICES</h2>
            <p style={pStyle}>
              The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.
            </p>
            <p style={pStyle}>
              The Services are not tailored to comply with industry-specific regulations (Health Insurance Portability and Accountability Act (HIPAA), Federal Information Security Management Act (FISMA), etc.), so if your interactions would be subjected to such laws, you may not use the Services. You may not use the Services in a way that would violate the Gramm-Leach-Bliley Act (GLBA).
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>2. INTELLECTUAL PROPERTY RIGHTS</h2>
            <h3 style={h3Style}>Our intellectual property</h3>
            <p style={pStyle}>
              We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the &ldquo;Content&rdquo;), as well as the trademarks, service marks, and logos contained therein (the &ldquo;Marks&rdquo;).
            </p>
            <p style={pStyle}>
              Our Content and Marks are protected by copyright and trademark laws (and various other intellectual property rights and unfair competition laws) and treaties in the United States and around the world.
            </p>
            <p style={pStyle}>
              The Content and Marks are provided in or through the Services &ldquo;AS IS&rdquo; for your personal, non-commercial use only.
            </p>
            <h3 style={h3Style}>Your use of our Services</h3>
            <p style={pStyle}>
              Subject to your compliance with these Legal Terms, including the &ldquo;PROHIBITED ACTIVITIES&rdquo; section below, we grant you a non-exclusive, non-transferable, revocable license to: access the Services; and download or print a copy of any portion of the Content to which you have properly gained access, solely for your personal, non-commercial use.
            </p>
            <p style={pStyle}>
              Except as set out in this section or elsewhere in our Legal Terms, no part of the Services and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
            </p>
            <p style={pStyle}>
              If you wish to make any use of the Services, Content, or Marks other than as set out in this section or elsewhere in our Legal Terms, please address your request to: caffeloja77@gmail.com. If we ever grant you the permission to post, reproduce, or publicly display any part of our Services or Content, you must identify us as the owners or licensors of the Services, Content, or Marks and ensure that any copyright or proprietary notice appears or is visible on posting, reproducing, or displaying our Content.
            </p>
            <p style={pStyle}>We reserve all rights not expressly granted to you in and to the Services, Content, and Marks.</p>
            <p style={pStyle}>
              Any breach of these Intellectual Property Rights will constitute a material breach of our Legal Terms and your right to use our Services will terminate immediately.
            </p>
            <h3 style={h3Style}>Your submissions</h3>
            <p style={pStyle}>
              Please review this section and the &ldquo;PROHIBITED ACTIVITIES&rdquo; section carefully prior to using our Services to understand the (a) rights you give us and (b) obligations you have when you post or upload any content through the Services.
            </p>
            <p style={pStyle}>
              <strong>Submissions:</strong> By directly sending us any question, comment, suggestion, idea, feedback, or other information about the Services (&ldquo;Submissions&rdquo;), you agree to assign to us all intellectual property rights in such Submission. You agree that we shall own this Submission and be entitled to its unrestricted use and dissemination for any lawful purpose, commercial or otherwise, without acknowledgment or compensation to you.
            </p>
            <p style={pStyle}>
              <strong>You are responsible for what you post or upload:</strong> By sending us Submissions through any part of the Services you: confirm that you have read and agree with our &ldquo;PROHIBITED ACTIVITIES&rdquo; and will not post, send, publish, upload, or transmit through the Services any Submission that is illegal, harassing, hateful, harmful, defamatory, obscene, bullying, abusive, discriminatory, threatening to any person or group, sexually explicit, false, inaccurate, deceitful, or misleading; to the extent permissible by applicable law, waive any and all moral rights to any such Submission; warrant that any such Submission are original to you or that you have the necessary rights and licenses to submit such Submissions and that you have full authority to grant us the above-mentioned rights in relation to your Submissions; and warrant and represent that your Submissions do not constitute confidential information.
            </p>
            <p style={pStyle}>
              You are solely responsible for your Submissions and you expressly agree to reimburse us for any and all losses that we may suffer because of your breach of (a) this section, (b) any third party’s intellectual property rights, or (c) applicable law.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>3. USER REPRESENTATIONS</h2>
            <p style={pStyle}>
              By using the Services, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Legal Terms; (4) you are not a minor in the jurisdiction in which you reside; (5) you will not access the Services through automated or non-human means, whether through a bot, script or otherwise; (6) you will not use the Services for any illegal or unauthorized purpose; and (7) your use of the Services will not violate any applicable law or regulation.
            </p>
            <p style={pStyle}>
              If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to suspend or terminate your account and refuse any and all current or future use of the Services (or any portion thereof).
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>4. USER REGISTRATION</h2>
            <p style={pStyle}>
              You may be required to register to use the Services. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>5. PRODUCTS</h2>
            <p style={pStyle}>
              We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Services. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors, and your electronic display may not accurately reflect the actual colors and details of the products. All products are subject to availability, and we cannot guarantee that items will be in stock. We reserve the right to discontinue any products at any time for any reason. Prices for all products are subject to change.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>6. PURCHASES AND PAYMENT</h2>
            <p style={pStyle}>We accept the following forms of payment: - Visa</p>
            <p style={pStyle}>
              You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Services. You further agree to promptly update account and payment information, including email address, payment method, and payment card expiration date, so that we can complete your transactions and contact you as needed. Sales tax will be added to the price of purchases as deemed required by us. We may change prices at any time. All payments shall be in US dollars.
            </p>
            <p style={pStyle}>
              You agree to pay all charges at the prices then in effect for your purchases and any applicable shipping fees, and you authorize us to charge your chosen payment provider for any such amounts upon placing your order. We reserve the right to correct any errors or mistakes in pricing, even if we have already requested or received payment.
            </p>
            <p style={pStyle}>
              We reserve the right to refuse any order placed through the Services. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. These restrictions may include orders placed by or under the same customer account, the same payment method, and/or orders that use the same billing or shipping address. We reserve the right to limit or prohibit orders that, in our sole judgment, appear to be placed by dealers, resellers, or distributors.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>7. SUBSCRIPTIONS</h2>
            <h3 style={h3Style}>Billing and Renewal</h3>
            <p style={pStyle}>__________</p>
            <h3 style={h3Style}>Cancellation</h3>
            <p style={pStyle}>
              You can cancel your subscription at any time by logging into your account. Your cancellation will take effect at the end of the current paid term. If you have any questions or are unsatisfied with our Services, please email us at caffeloja77@gmail.com.
            </p>
            <h3 style={h3Style}>Fee Changes</h3>
            <p style={pStyle}>
              We may, from time to time, make changes to the subscription fee and will communicate any price changes to you in accordance with applicable law.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>8. RETURN POLICY</h2>
            <p style={pStyle}>All sales are final and no refund will be issued.</p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>9. PROHIBITED ACTIVITIES</h2>
            <p style={pStyle}>
              You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
            </p>
            <p style={pStyle}>As a user of the Services, you agree not to:</p>
            <ul style={{ ...pStyle, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
              <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
              <li>Circumvent, disable, or otherwise interfere with security-related features of the Services, including features that prevent or restrict the use or copying of any Content or enforce limitations on the use of the Services and/or the Content contained therein.</li>
              <li>Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services.</li>
              <li>Use any information obtained from the Services in order to harass, abuse, or harm another person.</li>
              <li>Make improper use of our support services or submit false reports of abuse or misconduct.</li>
              <li>Use the Services in a manner inconsistent with any applicable laws or regulations.</li>
              <li>Engage in unauthorized framing of or linking to the Services.</li>
              <li>Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material, including excessive use of capital letters and spamming (continuous posting of repetitive text), that interferes with any party’s uninterrupted use and enjoyment of the Services or modifies, impairs, disrupts, alters, or interferes with the use, features, functions, operation, or maintenance of the Services.</li>
              <li>Engage in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar data gathering and extraction tools.</li>
              <li>Delete the copyright or other proprietary rights notice from any Content.</li>
              <li>Attempt to impersonate another user or person or use the username of another user.</li>
              <li>Upload or transmit (or attempt to upload or to transmit) any material that acts as a passive or active information collection or transmission mechanism, including without limitation, clear graphics interchange formats (&ldquo;gifs&rdquo;), 1×1 pixels, web bugs, cookies, or other similar devices (sometimes referred to as &ldquo;spyware&rdquo; or &ldquo;passive collection mechanisms&rdquo; or &ldquo;pcms&rdquo;).</li>
              <li>Interfere with, disrupt, or create an undue burden on the Services or the networks or services connected to the Services.</li>
              <li>Harass, annoy, intimidate, or threaten any of our employees or agents engaged in providing any portion of the Services to you.</li>
              <li>Attempt to bypass any measures of the Services designed to prevent or restrict access to the Services, or any portion of the Services.</li>
              <li>Copy or adapt the Services&apos; software, including but not limited to Flash, PHP, HTML, JavaScript, or other code.</li>
              <li>Except as permitted by applicable law, decipher, decompile, disassemble, or reverse engineer any of the software comprising or in any way making up a part of the Services.</li>
              <li>Except as may be the result of standard search engine or Internet browser usage, use, launch, develop, or distribute any automated system, including without limitation, any spider, robot, cheat utility, scraper, or offline reader that accesses the Services, or use or launch any unauthorized script or other software.</li>
              <li>Use a buying agent or purchasing agent to make purchases on the Services.</li>
              <li>Make any unauthorized use of the Services, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email, or creating user accounts by automated means or under false pretenses.</li>
              <li>Use the Services as part of any effort to compete with us or otherwise use the Services and/or the Content for any revenue-generating endeavor or commercial enterprise.</li>
              <li>Sell or otherwise transfer your profile.</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>10. USER GENERATED CONTRIBUTIONS</h2>
            <p style={pStyle}>The Services does not offer users to submit or post content.</p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>11. CONTRIBUTION LICENSE</h2>
            <p style={pStyle}>
              You and Services agree that we may access, store, process, and use any information and personal data that you provide and your choices (including settings).
            </p>
            <p style={pStyle}>
              By submitting suggestions or other feedback regarding the Services, you agree that we can use and share such feedback for any purpose without compensation to you.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>12. GUIDELINES FOR REVIEWS</h2>
            <p style={pStyle}>
              We may provide you areas on the Services to leave reviews or ratings. When posting a review, you must comply with the following criteria: (1) you should have firsthand experience with the person/entity being reviewed; (2) your reviews should not contain offensive profanity, or abusive, racist, offensive, or hateful language; (3) your reviews should not contain discriminatory references based on religion, race, gender, national origin, age, marital status, sexual orientation, or disability; (4) your reviews should not contain references to illegal activity; (5) you should not be affiliated with competitors if posting negative reviews; (6) you should not make any conclusions as to the legality of conduct; (7) you may not post any false or misleading statements; and (8) you may not organize a campaign encouraging others to post reviews, whether positive or negative.
            </p>
            <p style={pStyle}>
              We may accept, reject, or remove reviews in our sole discretion. We have absolutely no obligation to screen reviews or to delete reviews, even if anyone considers reviews objectionable or inaccurate. Reviews are not endorsed by us, and do not necessarily represent our opinions or the views of any of our affiliates or partners. We do not assume liability for any review or for any claims, liabilities, or losses resulting from any review. By posting a review, you hereby grant to us a perpetual, non-exclusive, worldwide, royalty-free, fully paid, assignable, and sublicensable right and license to reproduce, modify, translate, transmit by any means, display, perform, and/or distribute all content relating to review.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>13. SOCIAL MEDIA</h2>
            <p style={pStyle}>
              As part of the functionality of the Services, you may link your account with online accounts you have with third-party service providers (each such account, a &ldquo;Third-Party Account&rdquo;) by either: (1) providing your Third-Party Account login information through the Services; or (2) allowing us to access your Third-Party Account, as is permitted under the applicable terms and conditions that govern your use of each Third-Party Account. You represent and warrant that you are entitled to disclose your Third-Party Account login information to us and/or grant us access to your Third-Party Account, without breach by you of any of the terms and conditions that govern your use of the applicable Third-Party Account, and without obligating us to pay any fees or making us subject to any usage limitations imposed by the third-party service provider of the Third-Party Account.
            </p>
            <p style={pStyle}>
              By granting us access to any Third-Party Accounts, you understand that (1) we may access, make available, and store (if applicable) any content that you have provided to and stored in your Third-Party Account (the &ldquo;Social Network Content&rdquo;) so that it is available on and through the Services via your account, including without limitation any friend lists and (2) we may submit to and receive from your Third-Party Account additional information to the extent you are notified when you link your account with the Third-Party Account. Depending on the Third-Party Accounts you choose and subject to the privacy settings that you have set in such Third-Party Accounts, personally identifiable information that you post to your Third-Party Accounts may be available on and through your account on the Services. Please note that if a Third-Party Account or associated service becomes unavailable or our access to such Third-Party Account is terminated by the third-party service provider, then Social Network Content may no longer be available on and through the Services. You will have the ability to disable the connection between your account on the Services and your Third-Party Accounts at any time. PLEASE NOTE THAT YOUR RELATIONSHIP WITH THE THIRD-PARTY SERVICE PROVIDERS ASSOCIATED WITH YOUR THIRD-PARTY ACCOUNTS IS GOVERNED SOLELY BY YOUR AGREEMENT(S) WITH SUCH THIRD-PARTY SERVICE PROVIDERS. We make no effort to review any Social Network Content for any purpose, including but not limited to, for accuracy, legality, or non-infringement, and we are not responsible for any Social Network Content. You acknowledge and agree that we may access your email address book associated with a Third-Party Account and your contacts list stored on your mobile device or tablet computer solely for purposes of identifying and informing you of those contacts who have also registered to use the Services. You can deactivate the connection between the Services and your Third-Party Account by contacting us using the contact information below or through your account settings (if applicable). We will attempt to delete any information stored on our servers that was obtained through such Third-Party Account, except the username and profile picture that become associated with your account.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>14. SERVICES MANAGEMENT</h2>
            <p style={pStyle}>
              We reserve the right, but not the obligation, to: (1) monitor the Services for violations of these Legal Terms; (2) take appropriate legal action against anyone who, in our sole discretion, violates the law or these Legal Terms, including without limitation, reporting such user to law enforcement authorities; (3) in our sole discretion and without limitation, refuse, restrict access to, limit the availability of, or disable (to the extent technologically feasible) any of your Contributions or any portion thereof; (4) in our sole discretion and without limitation, notice, or liability, to remove from the Services or otherwise disable all files and content that are excessive in size or are in any way burdensome to our systems; and (5) otherwise manage the Services in a manner designed to protect our rights and property and to facilitate the proper functioning of the Services.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>15. PRIVACY POLICY</h2>
            <p style={pStyle}>
              We care about data privacy and security. By using the Services, you agree to be bound by our <Link href="/privacy-policy" style={{ color: 'var(--amber-light)' }}>Privacy Policy</Link> posted on the Services, which is incorporated into these Legal Terms. Please be advised the Services are hosted in the United States. If you access the Services from any other region of the world with laws or other requirements governing personal data collection, use, or disclosure that differ from applicable laws in the United States, then through your continued use of the Services, you are transferring your data to the United States, and you expressly consent to have your data transferred to and processed in the United States.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>16. TERM AND TERMINATION</h2>
            <p style={pStyle}>
              These Legal Terms shall remain in full force and effect while you use the Services. WITHOUT LIMITING ANY OTHER PROVISION OF THESE LEGAL TERMS, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SERVICES (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE LEGAL TERMS OR OF ANY APPLICABLE LAW OR REGULATION. WE MAY TERMINATE YOUR USE OR PARTICIPATION IN THE SERVICES OR DELETE YOUR ACCOUNT AND ANY CONTENT OR INFORMATION THAT YOU POSTED AT ANY TIME, WITHOUT WARNING, IN OUR SOLE DISCRETION.
            </p>
            <p style={pStyle}>
              If we terminate or suspend your account for any reason, you are prohibited from registering and creating a new account under your name, a fake or borrowed name, or the name of any third party, even if you may be acting on behalf of the third party. In addition to terminating or suspending your account, we reserve the right to take appropriate legal action, including without limitation pursuing civil, criminal, and injunctive redress.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>17. MODIFICATIONS AND INTERRUPTIONS</h2>
            <p style={pStyle}>
              We reserve the right to change, modify, or remove the contents of the Services at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Services. We also reserve the right to modify or discontinue all or part of the Services without notice at any time. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Services.
            </p>
            <p style={pStyle}>
              We cannot guarantee the Services will be available at all times. We may experience hardware, software, or other problems or need to perform maintenance related to the Services, resulting in interruptions, delays, or errors. We reserve the right to change, revise, update, suspend, discontinue, or otherwise modify the Services at any time or for any reason without notice to you. You agree that we have no liability whatsoever for any loss, damage, or inconvenience caused by your inability to access or use the Services during any downtime or discontinuance of the Services. Nothing in these Legal Terms will be construed to obligate us to maintain and support the Services or to supply any corrections, updates, or releases in connection therewith.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>18. GOVERNING LAW</h2>
            <p style={pStyle}>
              These Legal Terms and your use of the Services are governed by and construed in accordance with the laws of the State of Louisiana applicable to agreements made and to be entirely performed within the State of Louisiana, without regard to its conflict of law principles.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>19. DISPUTE RESOLUTION</h2>
            <h3 style={h3Style}>Informal Negotiations</h3>
            <p style={pStyle}>
              To expedite resolution and control the cost of any dispute, controversy, or claim related to these Legal Terms (each a &ldquo;Dispute&rdquo; and collectively, the &ldquo;Disputes&rdquo;) brought by either you or us (individually, a &ldquo;Party&rdquo; and collectively, the &ldquo;Parties&rdquo;), the Parties agree to first attempt to negotiate any Dispute (except those Disputes expressly provided below) informally for at least thirty (30) days before initiating arbitration. Such informal negotiations commence upon written notice from one Party to the other Party.
            </p>
            <h3 style={h3Style}>Binding Arbitration</h3>
            <p style={pStyle}>
              If the Parties are unable to resolve a Dispute through informal negotiations, the Dispute (except those Disputes expressly excluded below) will be finally and exclusively resolved by binding arbitration. YOU UNDERSTAND THAT WITHOUT THIS PROVISION, YOU WOULD HAVE THE RIGHT TO SUE IN COURT AND HAVE A JURY TRIAL. The arbitration shall be commenced and conducted under the Commercial Arbitration Rules of the American Arbitration Association (&ldquo;AAA&rdquo;) and, where appropriate, the AAA’s Supplementary Procedures for Consumer Related Disputes (&ldquo;AAA Consumer Rules&rdquo;), both of which are available at the American Arbitration Association (AAA) website. Your arbitration fees and your share of arbitrator compensation shall be governed by the AAA Consumer Rules and, where appropriate, limited by the AAA Consumer Rules. If such costs are determined by the arbitrator to be excessive, we will pay all arbitration fees and expenses. The arbitration may be conducted in person, through the submission of documents, by phone, or online. The arbitrator will make a decision in writing, but need not provide a statement of reasons unless requested by either Party. The arbitrator must follow applicable law, and any award may be challenged if the arbitrator fails to do so. Except where otherwise required by the applicable AAA rules or applicable law, the arbitration will take place in USA, Louisiana. Except as otherwise provided herein, the Parties may litigate in court to compel arbitration, stay proceedings pending arbitration, or to confirm, modify, vacate, or enter judgment on the award entered by the arbitrator.
            </p>
            <p style={pStyle}>
              If for any reason, a Dispute proceeds in court rather than arbitration, the Dispute shall be commenced or prosecuted in the state and federal courts located in USA, Louisiana, and the Parties hereby consent to, and waive all defenses of lack of personal jurisdiction, and forum non conveniens with respect to venue and jurisdiction in such state and federal courts. Application of the United Nations Convention on Contracts for the International Sale of Goods and the Uniform Computer Information Transaction Act (UCITA) are excluded from these Legal Terms.
            </p>
            <p style={pStyle}>
              In no event shall any Dispute brought by either Party related in any way to the Services be commenced more than one (1) years after the cause of action arose. If this provision is found to be illegal or unenforceable, then neither Party will elect to arbitrate any Dispute falling within that portion of this provision found to be illegal or unenforceable and such Dispute shall be decided by a court of competent jurisdiction within the courts listed for jurisdiction above, and the Parties agree to submit to the personal jurisdiction of that court.
            </p>
            <h3 style={h3Style}>Restrictions</h3>
            <p style={pStyle}>
              The Parties agree that any arbitration shall be limited to the Dispute between the Parties individually. To the full extent permitted by law, (a) no arbitration shall be joined with any other proceeding; (b) there is no right or authority for any Dispute to be arbitrated on a class-action basis or to utilize class action procedures; and (c) there is no right or authority for any Dispute to be brought in a purported representative capacity on behalf of the general public or any other persons.
            </p>
            <h3 style={h3Style}>Exceptions to Informal Negotiations and Arbitration</h3>
            <p style={pStyle}>
              The Parties agree that the following Disputes are not subject to the above provisions concerning informal negotiations binding arbitration: (a) any Disputes seeking to enforce or protect, or concerning the validity of, any of the intellectual property rights of a Party; (b) any Dispute related to, or arising from, allegations of theft, piracy, invasion of privacy, or unauthorized use; and (c) any claim for injunctive relief. If this provision is found to be illegal or unenforceable, then neither Party will elect to arbitrate any Dispute falling within that portion of this provision found to be illegal or unenforceable and such Dispute shall be decided by a court of competent jurisdiction within the courts listed for jurisdiction above, and the Parties agree to submit to the personal jurisdiction of that court.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>20. CORRECTIONS</h2>
            <p style={pStyle}>
              There may be information on the Services that contains typographical errors, inaccuracies, or omissions, including descriptions, pricing, availability, and various other information. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update the information on the Services at any time, without prior notice.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>21. DISCLAIMER</h2>
            <p style={pStyle}>
              THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE SERVICES&apos; CONTENT OR THE CONTENT OF ANY WEBSITES OR MOBILE APPLICATIONS LINKED TO THE SERVICES AND WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR ANY (1) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS, (2) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE SERVICES, (3) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN, (4) ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE SERVICES, (5) ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE WHICH MAY BE TRANSMITTED TO OR THROUGH THE SERVICES BY ANY THIRD PARTY, AND/OR (6) ANY ERRORS OR OMISSIONS IN ANY CONTENT AND MATERIALS OR FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF ANY CONTENT POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE SERVICES. WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR ANY PRODUCT OR SERVICE ADVERTISED OR OFFERED BY A THIRD PARTY THROUGH THE SERVICES, ANY HYPERLINKED WEBSITE, OR ANY WEBSITE OR MOBILE APPLICATION FEATURED IN ANY BANNER OR OTHER ADVERTISING, AND WE WILL NOT BE A PARTY TO OR IN ANY WAY BE RESPONSIBLE FOR MONITORING ANY TRANSACTION BETWEEN YOU AND ANY THIRD-PARTY PROVIDERS OF PRODUCTS OR SERVICES. AS WITH THE PURCHASE OF A PRODUCT OR SERVICE THROUGH ANY MEDIUM OR IN ANY ENVIRONMENT, YOU SHOULD USE YOUR BEST JUDGMENT AND EXERCISE CAUTION WHERE APPROPRIATE.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>22. LIMITATIONS OF LIABILITY</h2>
            <p style={pStyle}>
              IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, OUR LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE ACTION, WILL AT ALL TIMES BE LIMITED TO THE AMOUNT PAID, IF ANY, BY YOU TO US DURING THE SIX (6) MONTH PERIOD PRIOR TO ANY CAUSE OF ACTION ARISING. CERTAIN US STATE LAWS AND INTERNATIONAL LAWS DO NOT ALLOW LIMITATIONS ON IMPLIED WARRANTIES OR THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES. IF THESE LAWS APPLY TO YOU, SOME OR ALL OF THE ABOVE DISCLAIMERS OR LIMITATIONS MAY NOT APPLY TO YOU, AND YOU MAY HAVE ADDITIONAL RIGHTS.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>23. INDEMNIFICATION</h2>
            <p style={pStyle}>
              You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand, including reasonable attorneys’ fees and expenses, made by any third party due to or arising out of: (1) use of the Services; (2) breach of these Legal Terms; (3) any breach of your representations and warranties set forth in these Legal Terms; (4) your violation of the rights of a third party, including but not limited to intellectual property rights; or (5) any overt harmful act toward any other user of the Services with whom you connected via the Services. Notwithstanding the foregoing, we reserve the right, at your expense, to assume the exclusive defense and control of any matter for which you are required to indemnify us, and you agree to cooperate, at your expense, with our defense of such claims. We will use reasonable efforts to notify you of any such claim, action, or proceeding which is subject to this indemnification upon becoming aware of it.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>24. USER DATA</h2>
            <p style={pStyle}>
              We will maintain certain data that you transmit to the Services for the purpose of managing the performance of the Services, as well as data relating to your use of the Services. Although we perform regular routine backups of data, you are solely responsible for all data that you transmit or that relates to any activity you have undertaken using the Services. You agree that we shall have no liability to you for any loss or corruption of any such data, and you hereby waive any right of action against us arising from any such loss or corruption of such data.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>25. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</h2>
            <p style={pStyle}>
              Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications, and you agree that all agreements, notices, disclosures, and other communications we provide to you electronically, via email and on the Services, satisfy any legal requirement that such communication be in writing. YOU HEREBY AGREE TO THE USE OF ELECTRONIC SIGNATURES, CONTRACTS, ORDERS, AND OTHER RECORDS, AND TO ELECTRONIC DELIVERY OF NOTICES, POLICIES, AND RECORDS OF TRANSACTIONS INITIATED OR COMPLETED BY US OR VIA THE SERVICES. You hereby waive any rights or requirements under any statutes, regulations, rules, ordinances, or other laws in any jurisdiction which require an original signature or delivery or retention of non-electronic records, or to payments or the granting of credits by any means other than electronic means.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>26. SMS TEXT MESSAGING</h2>
            <h3 style={h3Style}>Program Description</h3>
            <p style={pStyle}>
              By opting into any caffeloja text messaging program, you expressly consent to receive text messages (SMS) to your mobile number. caffeloja text messages may include: marketing communications.
            </p>
            <h3 style={h3Style}>Opting Out</h3>
            <p style={pStyle}>
              If at any time you wish to stop receiving SMS messages from us, simply reply to the text with &ldquo;STOP.&rdquo; You may receive an SMS message confirming your opt out. After this, you will no longer receive SMS messages from us. If you want to join again, please sign up as you did the first time and we will start sending SMS messages to you again.
            </p>
            <h3 style={h3Style}>Message and Data Rates</h3>
            <p style={pStyle}>
              Please be aware that message and data rates may apply to any SMS messages sent or received. The rates are determined by your carrier and the specifics of your mobile plan. Carriers are not liable for delayed or undelivered messages. If you have any questions about your text plan or data plan, contact your wireless provider.
            </p>
            <h3 style={h3Style}>Support</h3>
            <p style={pStyle}>
              If you have any questions or need assistance regarding our SMS communications, please reply with the keyword HELP. You can also email us at caffeloja77@gmail.com or call at (+1)5043279670.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>27. CALIFORNIA USERS AND RESIDENTS</h2>
            <p style={pStyle}>
              If any complaint with us is not satisfactorily resolved, you can contact the Complaint Assistance Unit of the Division of Consumer Services of the California Department of Consumer Affairs in writing at 1625 North Market Blvd., Suite N 112, Sacramento, California 95834 or by telephone at (800) 952-5210 or (916) 445-1254.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>28. MISCELLANEOUS</h2>
            <p style={pStyle}>
              These Legal Terms and any policies or operating rules posted by us on the Services or in respect to the Services constitute the entire agreement and understanding between you and us. Our failure to exercise or enforce any right or provision of these Legal Terms shall not operate as a waiver of such right or provision. These Legal Terms operate to the fullest extent permissible by law. We may assign any or all of our rights and obligations to others at any time. We shall not be responsible or liable for any loss, damage, delay, or failure to act caused by any cause beyond our reasonable control. If any provision or part of a provision of these Legal Terms is determined to be unlawful, void, or unenforceable, that provision or part of the provision is deemed severable from these Legal Terms and does not affect the validity and enforceability of any remaining provisions. There is no joint venture, partnership, employment or agency relationship created between you and us as a result of these Legal Terms or use of the Services. You agree that these Legal Terms will not be construed against us by virtue of having drafted them. You hereby waive any and all defenses you may have based on the electronic form of these Legal Terms and the lack of signing by the parties hereto to execute these Legal Terms.
            </p>
          </div>

          <div>
            <h2 style={h2Style}>29. CONTACT US</h2>
            <p style={pStyle}>
              In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:
            </p>
            <div style={{ ...pStyle, background: 'rgba(230,157,69,0.08)', border: '1px solid var(--mocha-border)', borderRadius: '12px', padding: '18px' }}>
              <strong style={{ color: 'var(--text-primary)', display: 'block' }}>caffeloja</strong>
              <span>6005 Marcie St</span><br />
              <span>Metairie, LA 70003</span><br />
              <span>United States</span><br />
              <span>Phone: (+1)5043279670</span><br />
              <a href="mailto:caffeloja77@gmail.com" style={{ color: 'var(--amber-light)' }}>caffeloja77@gmail.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

