module.exports = {
  name: "AUGÉ Manufacturing",
  // WICHTIG: Das Template sucht nach 'contact.address' usw.
  contact: {
    address: "Eichenstraße 4, 83083 Riedering",
    phone: "+4915202408592",
    email: "info@auge-manufacturing.de",
    cta_link: "mailto:info@auge-manufacturing.de"
  },
  services: [
    { 
      title: "CNC Fräsen", 
      icon: "⚙️", 
      // WICHTIG: Das Template sucht nach 'description' (nicht 'text')
      description: "3-Achs-Bearbeitung von Stahl, NE-Metallen und technischen Kunststoffen." 
    },
    { 
      title: "CAD Konstruktion", 
      icon: "📐", 
      description: "Fertigungsgerechte 3D-Modellierung und konstruktive Begleitung." 
    },
    { 
      title: "Lohnfertigung", 
      icon: "🏭", 
      description: "Schnelle und präzise CNC-Zerspanung für anspruchsvolle Einzelkomponenten und Prototypen." 
    }
  ],
  socials: [
    { icon: "FB", url: "#" },
    { icon: "LI", url: "#" },
    { icon: "IG", url: "#" }
  ]
};