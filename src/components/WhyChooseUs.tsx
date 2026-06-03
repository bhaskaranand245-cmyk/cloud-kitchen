import { Leaf, Clock, Banknote, ShieldAlert, BadgeHelp, HeartHandshake } from 'lucide-react';
import { motion } from 'motion/react';

export default function WhyChooseUs() {
  const highlights = [
    {
      title: "100% Fresh Ingredients",
      description: "Produce acquired fresh at 5:00 AM daily. We crush raw spices on traditional stone mills to retain oil richness.",
      icon: Leaf,
      color: "bg-green-50 text-green-700 hover:bg-green-100"
    },
    {
      title: "Hygienic Class-A Kitchen",
      description: "Full stainless steel countertops, triple reverse-osmosis purified water, and strict daily health logs.",
      icon: ShieldAlert,
      color: "bg-red-50 text-red-700 hover:bg-red-100"
    },
    {
      title: "On-Clock Fast Delivery",
      description: "Dedicated regional route dispatch riders ensure your tiffins reach you hot, fresh, and perfectly leak-sealed.",
      icon: Clock,
      color: "bg-blue-50 text-blue-700 hover:bg-blue-100"
    },
    {
      title: "Affordable Smart Pricing",
      description: "High-grade premium meals costing less than standard commercial restaurants. No premium markups on subscriptions.",
      icon: Banknote,
      color: "bg-amber-50 text-amber-700 hover:bg-amber-100"
    },
    {
      title: "Dual Payment Security",
      description: "Pre-integrated with leading Razorpay, PhonePe & BHIM UPI protocols for secure end-to-end checkout encryption.",
      icon: HeartHandshake,
      color: "bg-purple-50 text-purple-700 hover:bg-purple-100"
    },
    {
      title: "Dedicated Human Support",
      description: "Instant WhatsApp updates and continuous voice assistance over our dedicated business helpline.",
      icon: BadgeHelp,
      color: "bg-teal-50 text-teal-700 hover:bg-teal-100"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">Why Choose Bhagwati</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-900 leading-tight">
            We Redefined the Indian Cloud Dining Experience
          </h2>
          <p className="text-sm text-neutral-500 font-sans">
            Bridging the gap between street fast-food and healthy mom-cooked home nutrition. Clean cooking rules we never break.
          </p>
        </div>

        {/* Grid List */}
        <div id="why-choose-us-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {highlights.map((h, idx) => {
            const Icon = h.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl border border-neutral-200/50 hover:border-orange-200 hover:shadow-lg transition-all duration-300 bg-white group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className={`p-3 rounded-xl w-fit ${h.color} transition-colors duration-300`}>
                    <Icon className="w-6 h-6 flex-shrink-0" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 group-hover:text-red-950 transition-colors">
                      {h.title}
                    </h3>
                    <p className="text-xs text-neutral-500 font-sans leading-relaxed mt-2">
                      {h.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100/60 flex items-center justify-between text-[11px] text-neutral-400 font-semibold uppercase">
                  <span>Hygienic Sealed</span>
                  <span className="text-orange-600">Pure-Veg Certified</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
