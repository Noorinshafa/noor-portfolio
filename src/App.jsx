import Navbar from './components/navigation/Navbar';
import ScrollSpark from './components/animations/ScrollSpark';
import CursorSparkles from './components/animations/CursorSparkles';
import Hero from './components/sections/Hero';
import Tour from './components/sections/Tour';
import About from './components/sections/About';
import Journey from './components/sections/Journey';
import Skills from './components/sections/Skills';
import Projects from './components/sections/Projects';
import Creative from './components/sections/Creative';
import Interlude from './components/sections/Interlude';
import Mind from './components/sections/Mind';
import Approach from './components/sections/Approach';
import Playground from './components/sections/Playground';
import Contact from './components/sections/Contact';
import Footer from './components/layout/Footer';
import CaseStudy from './pages/CaseStudy';
import useHashRoute from './hooks/useHashRoute';

export default function App() {
  const { slug, open, close } = useHashRoute();
  return (
    <>
      <Navbar />
      <ScrollSpark />
      <CursorSparkles />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Tour />
        <About />
        <Journey />
        <Skills />
        <Projects onOpen={open} />
        <Creative />
        <Interlude />
        <Mind />
        <Approach />
        <Playground />
        <Contact />
      </main>
      <Footer />
      {slug ? <CaseStudy slug={slug} onClose={close} onNavigate={open} /> : null}
    </>
  );
}
