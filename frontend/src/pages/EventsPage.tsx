import EventsSection from "../components/home/EventsSection";

export default function EventsPage() {
  return (
    <div style={{ paddingTop: '40px', backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <div className="container">
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.04em' }}>Eventi e Sagre</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '40px', maxWidth: '600px' }}>
          Scopri gli eventi gastronomici, le degustazioni e le sagre in programma vicino a te.
        </p>
      </div>
      <EventsSection />
    </div>
  );
}
