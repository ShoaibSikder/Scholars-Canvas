export default function SectionTransition({ children, sectionKey }) {
  return <div key={sectionKey} className="grid gap-4">{children}</div>;
}
