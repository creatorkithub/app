import { BlogSidebar } from '../../components/BlogSidebar';
import { BlogFooter } from '../../components/BlogFooter';

export default function A11yScorecardGuide({ onNavigate }: { onNavigate: (path: string) => void }) {
    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-300 p-4 sm:p-8 font-sans selection:bg-rose-500/30 overflow-y-auto w-full pb-24">

            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 pt-6">

                {/* Left Column: Article */}
                <div className="flex-1 lg:max-w-3xl flex flex-col gap-8">
                    <button
                        onClick={() => onNavigate('/blog')}
                        className="self-start flex items-center gap-2 text-zinc-500 hover:text-zinc-200 transition-colors text-sm font-semibold tracking-wide uppercase group"
                    >
                        <svg className="transform group-hover:-translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                        Back to Articles
                    </button>

                    <header className="border-b border-zinc-800 pb-10">
                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-rose-400 mb-6">
                            <span>Accessibility</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
                            <span>9 min read</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
                            <span>Sep 11, 2026</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-zinc-100 mb-6 leading-[1.1] tracking-tight">
                            The Complete Guide to Web Accessibility and Color Contrast
                        </h1>
                        <p className="text-xl sm:text-2xl text-zinc-400 font-medium leading-relaxed max-w-2xl">
                            Designing a beautiful UI entails more than just aesthetics. It is heavily about ensuring every single user, regardless of their visual capabilities, can smoothly navigate and digest your content.
                        </p>
                    </header>

                    <article className="flex flex-col space-y-6 text-[#94a3b8] text-lg lg:text-[1.15rem] leading-[1.8] lg:leading-[2.1] tracking-wide">

                        <p>Imagine reading a classic novel where the ink on the pages is barely darker than the paper itself. You would squint, struggle, and eventually put the book down in sheer frustration. This exact scenario plays out billions of times a day across the internet, yet it is completely preventable. Over the recent decade, design trends forcefully gravitated toward minimalist interfaces featuring faint grey text layered atop pure white backgrounds. While many designers argue this looks phenomenally sophisticated and clean on their Retina monitors in perfectly lit offices, it creates an absolute nightmare for a massive chunk of humanity.</p>

                        <p>Web accessibility is not an obscure technical buzzword or a mundane compliance checklist created solely for government websites. It is the fundamental heartbeat of inclusive design. It guarantees that an elderly person with natural vision deterioration, someone riding a train with glaring sunlight hitting their phone screen, or a person with specific color vision deficiencies can still order groceries, read emergency alerts, and comfortably interact with digital software. When we ignore robust contrast ratios, we silently erect massive invisible walls that actively block people from leveraging our services.</p>

                        <h2 className="text-2xl lg:text-3xl font-bold text-zinc-100 mt-10 mb-2">The Absolute Necessity of High Contrast</h2>

                        <p>When web developers talk about color contrast, they are strictly referencing the mathematical difference in luminance between a piece of foreground text and its underlying background color. The World Wide Web Consortium (W3C), the definitive governing body of web standards, publishes the Web Content Accessibility Guidelines (WCAG). These internationally recognized guidelines operate based on rigid, verifiable mathematics rather than subjective human opinions.</p>

                        <p>For standard digital text, WCAG strongly dictates a minimum contrast ratio of exactly 4.5 to 1. This means the foreground color must be four and a half times brighter (or darker) than the background it sits upon. For larger, chunkier text, such as prominent bold headlines, the requirement slightly relaxes to a 3.0 to 1 ratio because large font geometries are inherently easier for the human eye to distinguish. Achieving this baseline instantly opens your application up to millions of users who would otherwise bounce off your page instantly.</p>

                        <div className="bg-[#18181b] p-8 rounded-2xl border border-zinc-800 my-6 shadow-2xl">
                            <h4 className="text-lg font-bold text-zinc-100 mb-4">Core Benefits of Accessible Contrast:</h4>
                            <ul className="text-[#a1a1aa] space-y-4 list-disc pl-6 marker:text-rose-500/50">
                                <li><strong className="text-zinc-300">Broader Demographic Reach:</strong> With the global population rapidly aging, millions of potential customers naturally require higher contrast interfaces to engage effectively.</li>
                                <li><strong className="text-zinc-300">Harsh Environment Legibility:</strong> Good contrast massively improves usability in terrible lighting conditions, such as reading a phone screen on a bright sandy beach or a badly lit office.</li>
                                <li><strong className="text-zinc-300">Legal Risk Mitigation:</strong> Countless multinational corporations have been severely penalized in massive lawsuits for maintaining digitally inaccessible storefronts and software that ostracize disabled folks.</li>
                            </ul>
                        </div>

                        <h2 className="text-2xl lg:text-3xl font-bold text-zinc-100 mt-10 mb-2">The Hidden Dangers of Color Blindness</h2>

                        <p>Beyond simple contrast, how designers pair deeply saturated colors matters immensely. Approximately three hundred million people globally have some form of color vision deficiency (often loosely referred to as color blindness). The most overwhelmingly common form, Deuteranomaly, heavily impacts a person's ability to distinguish clearly between red and green hues.</p>

                        <p>If your digital interface rigidly replies on a red colored box to indicate a critical error, and a green colored box to rapidly indicate a successful action without featuring any supplemental text or icons, you are alienating a massive user base. To a user with deuteranopia, both of those intensely colored status boxes might visually register as nearly identical muddy shades of yellowish-brown. They are left completely guessing whether their massive financial transaction succeeded beautifully or failed catastrophically.</p>

                        <p>To combat this severe issue, diligent developers must completely decouple critical information from color alone. Always pair colored statuses with distinctive geometric shapes. Append an unmistakable warning triangle icon clearly inside the red error box. Incorporate a thick, bold checkmark firmly inside the green success container. The visual pairing ensures the required information seamlessly transverses the massive barrier of color deficiency.</p>

                        <h2 className="text-2xl lg:text-3xl font-bold text-zinc-100 mt-10 mb-2">How to Actually Verify Your Interface</h2>

                        <p>Guessing at contrast combinations by blindly trusting your eye is incredibly dangerous. As we age, or simply stare at backlit screens for ten hours straight, our perception becomes deeply skewed. You absolutely must employ rigorous mathematical evaluation tools before pushing your product into public production. This step is completely non-negotiable for serious software engineering teams.</p>

                        <p>Historically, designers would upload full screenshots of their impending prototypes to obscure third-party cloud servers to get these grades. That severely opens up massive security vulnerabilities regarding unreleased proprietary intellectual property. Today, utilizing client-side tools strictly operating in your local browser completely solves this. With utility applications like the <a href="/a11y-scorecard" onClick={(e) => { e.preventDefault(); onNavigate('/a11y-scorecard'); }} className="text-rose-400 hover:text-rose-300 underline font-medium">A11y Scorecard checker</a>, you can vigorously test hex codes rapidly without a single byte of your data ever leaving your own secure desktop.</p>

                        <p>By inputting your primary background hue alongside your intended text color, the scorecard definitively validates passing grades across WCAG 2.0 AA and the much stricter AAA standards. It instantaneously takes the guesswork drastically out of the equation, outputting undeniable pass or fail metrics.</p>

                        <h2 className="text-2xl lg:text-3xl font-bold text-zinc-100 mt-10 mb-2">Redesigning with a Compliance-First Mindset</h2>

                        <p>Refactoring an entire enterprise codebase to meet accessibility standards retroactively is painfully expensive and frustratingly tedious. The ultimate key lies in injecting compliance explicitly during the initial wireframing and design token generation phases. A diligent engineering team establishes strict color variables from day one, deeply testing them in local utility environments.</p>

                        <p>You can still absolutely maintain a gorgeous, undeniably sleek brand identity while rigidly adhering to these crucial safety limits. In reality, deeply saturated accents paired with highly readable contrasting text often yield dramatic, beautiful aesthetics far superior to the washed-out trends of the past. Accessible design is simply better design for absolutely everyone.</p>

                        <p>It fundamentally boils down to deep digital empathy. Software is the primary bridge connecting humanity today. By prioritizing rigorous contrast checking explicitly through lightning-fast offline tools, we ensure that the digital bridges we passionately construct remain wide open, welcoming, and entirely accessible to everyone on earth.</p>

                    </article>
                    <BlogFooter tags={['Accessibility', 'UI/UX', 'Design', 'WCAG']} currentPath="/blog/a11y-scorecard-guide" onNavigate={onNavigate} />
                </div>

                {/* Right Column: Promotional Sidebar */}
                <BlogSidebar onNavigate={onNavigate} />

            </div>
        </div>
    );
}
