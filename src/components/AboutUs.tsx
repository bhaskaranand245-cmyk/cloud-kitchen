import React from 'react';
import { CheckCircle, Award, ShieldAlert, ThermometerSnowflake, Users } from 'lucide-react';
import { motion } from 'motion/react';

export default function AboutUs() {
  const values = [
    {
      title: "100% Hygienic Kitchen",
      description: "Daily sanitization, temperature checks, and mandatory hairnets & gloves for all our chefs. Pure-veg standard preparation workspace.",
      icon: ShieldAlert,
      color: "text-red-700 bg-red-50"
    },
    {
      title: "Farm-Fresh Raw Ingredients",
      description: "We pick fresh regional vegetables and premium ground spices every morning. Zero frozen meals or artificial enhancers.",
      icon: ThermometerSnowflake,
      color: "text-orange-600 bg-orange-50"
    },
    {
      title: "Authentic Homemade Taste",
      description: "Prepared by home-maker chefs trained in traditional family recipes, giving you that rich, comforting motherly touch.",
      icon: Award,
      color: "text-amber-600 bg-amber-50"
    },
    {
      title: "Vast Monthly Community",
      description: "Proudly feeding over 800+ students, office professionals, and families in Pune every week through customized tiffins.",
      icon: Users,
      color: "text-blue-600 bg-blue-50"
    }
  ];

  return (
    <section id="about-section" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Images Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden aspect-4/5 shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=400&auto=format&fit=crop"
                  alt="Hygienic kitchen preparation Indian meal"
                  className="w-full h-full object-cover hover:scale-105 transition duration-500"
                />
              </div>
              <div className="bg-orange-600 text-white p-6 rounded-2xl text-center shadow-lg shadow-orange-600/20">
                <p className="text-3xl font-serif font-extrabold text-amber-300">100%</p>
                <p className="text-xs uppercase tracking-wider font-bold mt-1">Pure Vegetarian</p>
                <p className="text-xs text-orange-200 mt-1">Separate pure-veg spaces & vessels utilized</p>
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="bg-red-950 text-white p-6 rounded-2xl text-center shadow-lg">
                <p className="text-3xl font-serif font-extrabold text-amber-400">99.8%</p>
                <p className="text-xs uppercase tracking-wider font-bold mt-1">On-Time Delivery</p>
                <p className="text-xs text-neutral-300 mt-1">Delivered hot before your lunch breaker</p>
              </div>
              <div className="rounded-2xl overflow-hidden aspect-4/5 shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=400&auto=format&fit=crop"
                  alt="Fresh vegetables and Indian spices"
                  className="w-full h-full object-cover hover:scale-105 transition duration-500"
                />
              </div>
            </div>
          </div>

          {/* Text & Specs */}
          <div className="space-y-8">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">Our Story</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-900 mt-3 leading-tight">
                Authentic Homemade Delicacies, Prepared with Deep Love & Hygiene
              </h2>
              <p className="text-neutral-600 font-sans mt-4 leading-relaxed">
                At <strong>Bhagwati Cloud Kitchen</strong>, we believe food is the highest expression of care. Founded with a vision to serve students and hard-working professionals in Pune, we deliver complete, nutrient-rich meals that taste exactly like home. We strictly avoid taste enhancers, colors, or excessive oils.
              </p>
            </div>

            {/* Core Values Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {values.map((v, idx) => {
                const Icon = v.icon;
                return (
                  <div key={idx} className="flex gap-4 p-4 rounded-xl border border-neutral-100 hover:border-orange-200/50 hover:bg-neutral-50/50 transition duration-300">
                    <div className={`p-2.5 rounded-lg h-fit ${v.color}`}>
                      <Icon className="w-5 h-5 flex-shrink-0" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900">{v.title}</h4>
                      <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{v.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quote badge */}
            <div className="p-4 border-l-4 border-orange-600 bg-orange-50/40 rounded-r-xl">
              <p className="text-sm italic font-medium text-neutral-700">
                &ldquo;We don&rsquo;t operate standard luxury restaurant assembly lines. We cook small batches in homestyle vessels so your digestion is safe and the taste stays genuine.&rdquo;
              </p>
              <span className="block text-xs font-bold text-orange-700 mt-2">— Bhagwati Kitchen Master Chef</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
