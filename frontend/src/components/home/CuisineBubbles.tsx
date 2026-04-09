import { motion } from "framer-motion";
import { useRef } from "react";

interface CuisineItem {
  id: string;
  name: string;
  icon: string;
}

const CUISINES: CuisineItem[] = [
  { id: "mexico", name: "Messico", icon: "🇲🇽" },
  { id: "argentina", name: "Argentina", icon: "🇦🇷" },
  { id: "brazil", name: "Brasile", icon: "🇧🇷" },
  { id: "colombia", name: "Colombia", icon: "🇨🇴" },
  { id: "peru", name: "Perù", icon: "🇵🇪" },
  { id: "venezuela", name: "Venezuela", icon: "🇻🇪" },
  { id: "chile", name: "Cile", icon: "🇨🇱" },
  { id: "ecuador", name: "Ecuador", icon: "🇪🇨" },
  { id: "bolivia", name: "Bolivia", icon: "🇧🇴" },
  { id: "paraguay", name: "Paraguay", icon: "🇵🇾" },
  { id: "uruguay", name: "Uruguay", icon: "🇺🇾" },
  { id: "cuba", name: "Cuba", icon: "🇨🇺" },
  { id: "dominican", name: "Rep. Dominicana", icon: "🇩🇴" },
  { id: "puerto", name: "Puerto Rico", icon: "🇵🇷" },
  { id: "guatemala", name: "Guatemala", icon: "🇬🇹" },
  { id: "honduras", name: "Honduras", icon: "🇭🇳" },
  { id: "salvador", name: "El Salvador", icon: "🇸🇻" },
  { id: "nicaragua", name: "Nicaragua", icon: "🇳🇮" },
  { id: "costa", name: "Costa Rica", icon: "🇨🇷" },
  { id: "panama", name: "Panama", icon: "🇵🇦" },
];

interface CuisineBubblesProps {
  onSelectCuisine: (name: string) => void;
  selectedCuisine: string;
}

export default function CuisineBubbles({ onSelectCuisine, selectedCuisine }: CuisineBubblesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section style={{ padding: '60px 0 40px', background: 'white', overflow: 'hidden' }}>
      <div className="container">
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Esplora per Paese</h3>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tira per scrollare →</span>
        </div>
        
        <motion.div 
          ref={scrollRef}
          className="hide-scrollbar"
          style={{ 
            display: 'flex', 
            gap: '24px', 
            overflowX: 'auto', 
            padding: '20px 5px 40px',
            cursor: 'grab'
          }}
          whileTap={{ cursor: 'grabbing' }}
        >
          {CUISINES.map((cuisine, index) => (
            <motion.div
              key={cuisine.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              style={{ flex: '0 0 auto' }}
            >
              <motion.button
                whileHover={{ y: -8, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={selectedCuisine === cuisine.name ? {
                  y: [0, -5, 0],
                  transition: { duration: 2, repeat: Infinity }
                } : {}}
                onClick={() => onSelectCuisine(cuisine.name)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0',
                  outline: 'none',
                  width: '100px'
                }}
              >
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: selectedCuisine === cuisine.name ? 'var(--primary)' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.8rem',
                  boxShadow: selectedCuisine === cuisine.name 
                    ? '0 15px 30px -5px rgba(255, 90, 31, 0.4)' 
                    : '0 8px 20px -10px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease',
                  border: selectedCuisine === cuisine.name ? '4px solid #fff' : '1px solid #f1f5f9',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Subtle shine effect */}
                  <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.1) 50%, transparent 55%)',
                    animation: 'shine 3s infinite'
                  }}></div>
                  {cuisine.icon}
                </div>
                <span style={{ 
                  fontSize: '0.95rem', 
                  fontWeight: 800, 
                  color: selectedCuisine === cuisine.name ? 'var(--primary)' : 'var(--text-main)',
                  transition: 'color 0.3s',
                  textAlign: 'center',
                  lineHeight: 1.2
                }}>
                  {cuisine.name}
                </span>
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </div>
      <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%) translateY(-100%); }
          100% { transform: translateX(100%) translateY(100%); }
        }
      `}</style>
    </section>
  );
}
