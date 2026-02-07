module.exports = {
  name: "AUGE Manufacturing",
  // WICHTIG: Das Template sucht nach 'contact.address' usw.
  contact: {
    address: "Musterstraße 1, 12345 Stadt",
    phone: "(906) 138-1900",
    email: "info@augemanufacturing.com",
    cta_link: "mailto:info@augemanufacturing.com"
  },
  services: [
    { 
      title: "CNC Fräsen", 
      icon: "⚙️", 
      // WICHTIG: Das Template sucht nach 'description' (nicht 'text')
      description: "Spezialisiert auf die präzise 3-Achs-Bearbeitung von Aluminium, Stahl und Kunststoffen." 
    },
    { 
      title: "CAD Konstruktion", 
      icon: "📐", 
      description: "Wir optimieren Ihre Bauteile für eine effiziente Fertigung oder erstellen 3D-Modelle." 
    },
    { 
      title: "Lohnfertigung", 
      icon: "🏭", 
      description: "Flexible Kapazitäten für Einzelteile und Kleinserien dank zwei identischer Maschinen." 
    }
  ],
  socials: [
    { icon: "FB", url: "#" },
    { icon: "LI", url: "#" },
    { icon: "IG", url: "#" }
  ]
};