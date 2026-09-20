import { BlogSidebar } from '../../components/BlogSidebar';
import { BlogFooter } from '../../components/BlogFooter';

export default function TypographyDummyText({ onNavigate }: { onNavigate: (path: string) => void }) {
    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-300 p-4 sm:p-8 font-sans selection:bg-rose-500/30 overflow-y-auto w-full pb-24">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 pt-6">

                {/* Left Column: Article */}
                <div className="flex-1 lg:max-w-3xl flex flex-col gap-8">
                    <button
                        onClick={() => onNavigate('/blog/')}
                        className="self-start flex items-center gap-2 text-zinc-500 hover:text-zinc-200 transition-colors text-sm font-semibold tracking-wide uppercase group"
                    >
                        <svg className="transform group-hover:-translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                        Back to Articles
                    </button>

                    <header className="border-b border-zinc-800 pb-10">
                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-indigo-400 mb-6">
                            <span>UI/UX Design</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
                            <span>9 min read</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
                            <span>Sep 20, 2026</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-zinc-100 mb-6 leading-[1.1] tracking-tight">
                            The Psychology of Typography: How Dummy Text Enhances UI Prototyping
                        </h1>
                        <p className="text-xl sm:text-2xl text-zinc-400 font-medium leading-relaxed max-w-2xl">
                            Real text introduces bias. Discover how using generated dummy text strips away meaning to reveal the true visual hierarchy of your design layouts.
                        </p>
                    </header>

                    <article className="flex flex-col space-y-6 text-[#94a3b8] text-lg lg:text-[1.15rem] leading-[1.8] lg:leading-[2.1] tracking-wide">

                        <p>When designing a user interface, our ultimate goal is to create a seamless, frictionless experience where structural hierarchy logically guides the user's eye. However, we often sabotage our own design prototypes by introducing real content prematurely. While content is undeniably the key driver of user engagement, inserting it into early-stage wireframes triggers subtle, unconscious biases that completely derail objective visual analysis.</p>

                        <p>This psychological phenomenon is known as "cognitive load through semantic distraction." The human brain is an aggressive meaning-making machine. When presented with a paragraph of readable text, your brain instinctively begins to parse the syntax, evaluate the argument, and emotionally respond to the message. It entirely forgets to evaluate the padding, line height, font weight, and structural balance. This is exactly why the use of dummy text, specifically forms of Lorem Ipsum, has remained a foundational design principle for over five centuries.</p>

                        <h2 className="text-2xl lg:text-3xl font-bold text-zinc-100 mt-10 mb-2">The Danger of Real Copy in Early Prototyping</h2>

                        <p>Imagine you are presenting a brand-new dashboard layout to a client. The dashboard is meticulously crafted, focusing purely on component placement, grid alignment, and negative space tuning. However, to make it "look realistic," you pull some real copy from their existing marketing materials and drop it into the cards.</p>

                        <p>What happens during the presentation? Instead of analyzing the interface, the client reads the copy. Instantly, the conversation devolves into, "I don't think we should use the word 'synergy' here," or "That statistic is from last year." The layout is completely ignored. The feedback loop is shattered. Real text distracts from the architecture.</p>

                        <p>By utilizing generated dummy text, you forcibly shift the cognitive focus from what the text says to how the text looks. The nonsensical Latin roots of Lorem Ipsum mimic the visual characteristics of English (such as word length variance, sentence structure, and punctuation frequency) without triggering semantic processing. It forces both designers and clients to evaluate the design strictly as an arrangement of shapes, shades, and mathematical ratios.</p>

                        <h2 className="text-2xl lg:text-3xl font-bold text-zinc-100 mt-10 mb-2">Visual Texture and Typographic Color</h2>

                        <p>In typography, "color" doesn't just refer to hex codes. Typographic color refers to the overall density, lightness, or darkness of a block of text on the page. It is determined by font weight, tracking (letter spacing), leading (line height), and the physical shapes of the letters themselves.</p>

                        <p>Using a tool like a <a href="/lorem-builder/" onClick={(e) => { e.preventDefault(); onNavigate('/lorem-builder/'); }} className="text-indigo-400 hover:text-indigo-300 underline font-medium">Lorem Builder</a> allows designers to generate massive blocks of text specifically tuned to evaluate this typographic color. When you view a block of dummy text and blur your eyes, you should see an even, consistent grey texture. If you notice dark spots (rivers of text or tight tracking) or overly light gaps, the typography requires immediate adjustment. Without dummy text, your brain interprets those dark spots as "important words" rather than "design flaws."</p>

                        <div className="bg-[#18181b] p-8 rounded-2xl border border-zinc-800 my-6 shadow-2xl">
                            <h4 className="text-lg font-bold text-zinc-100 mb-4">Core Principles of Dummy Text in UI:</h4>
                            <ul className="text-[#a1a1aa] space-y-4 list-disc pl-6 marker:text-indigo-500/50">
                                <li><strong className="text-zinc-300">Semantic Detachment:</strong> Removing meaning ensures that layout, spacing, and structural hierarchy are evaluated objectively without emotional or cognitive bias.</li>
                                <li><strong className="text-zinc-300">Accurate Word Length Distribution:</strong> Good generators, unlike random keystrokes (e.g., asdf jkl), replicate the natural variation in word lengths, creating realistic ragged edges.</li>
                                <li><strong className="text-zinc-300">Rapid Component Stress Testing:</strong> Generate extremely long paragraphs to immediately test how your cards and containers react to unexpected content overflow.</li>
                            </ul>
                        </div>

                        <h2 className="text-2xl lg:text-3xl font-bold text-zinc-100 mt-10 mb-2">Offline Generation for Maximum Security</h2>

                        <p>While generating dummy text seems trivial, the modern web has overcomplicated it. Many designers rely on cloud-based APIs or heavy external web applications just to fetch a few paragraphs of Latin. This not only wastes bandwidth but introduces unnecessary dependencies into your workflow. If your internet connection drops while you are working in Figma or VS Code, your design process grinds to a halt.</p>

                        <p>This is where client-side, offline-first tools become critical. By executing the generation logic entirely via local JavaScript, you eliminate network latency. The text generation is instantaneous. There is no tracking, no rate-limiting, and absolutely zero API keys to configure. You simply open the tool, define your paragraph constraints, and securely copy the output.</p>

                        <h2 className="text-2xl lg:text-3xl font-bold text-zinc-100 mt-10 mb-2">Stress-Testing Responsive Components</h2>

                        <p>One of the most powerful uses of a custom text builder is the ability to stress-test your responsive layouts. Far too often, designers design for the "happy path" - a perfect, concise sentence that fits beautifully into a sleek card component. But in production, users input massive, unbroken strings of text, breaking the layout and ruining the user experience.</p>

                        <p>By generating edge-case lorem blocks, you can safely explore how your UI reacts to extreme constraints. Does the text wrap properly on a 320px mobile screen? Does the line height remain readable when a paragraph stretches across a 4K monitor? Does the overflow behavior truncate flawlessly with an ellipsis? Dummy text is the ultimate QA tool for frontend developers.</p>

                        <p>Ultimately, dummy text is not just a placeholder; it is an active diagnostic tool. Next time you build a layout, resist the urge to drop in real data. Relish the nonsense, focus on the geometry, and let the typography speak purely through its form.</p>

                    </article>
                    <BlogFooter tags={['Typography', 'Design', 'Prototyping']} currentPath="/blog/psychology-of-typography" onNavigate={onNavigate} />
                </div>

                {/* Right Column: Promotional Sidebar */}
                <BlogSidebar onNavigate={onNavigate} />

            </div>
        </div>
    );
}
