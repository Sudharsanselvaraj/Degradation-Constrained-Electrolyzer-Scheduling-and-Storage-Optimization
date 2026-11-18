/**
 * HYDRAULIX - Central Lifecycle Media Manifest
 * Maps original, authorized Lifecycle reference media assets to page sections.
 */

const B = import.meta.env.BASE_URL;

export const LIFECYCLE_MEDIA = {
  hero: {
    video: B + "assets/lifecycle-media/hero/hero-video.mp4",
    poster: B + "assets/lifecycle-media/hero/hero-poster.jpg",
  },
  appliedEfficiency: {
    cardOne: B + "assets/lifecycle-media/applied-efficiency/card-one.webp",
    cardTwo: B + "assets/lifecycle-media/applied-efficiency/card-two.webp",
    panelBg: B + "assets/lifecycle-media/applied-efficiency/panel-background.webp",
    portrait: B + "assets/lifecycle-media/applied-efficiency/author-portrait.webp",
    speedometerIcon: B + "assets/lifecycle-media/icons/speedometer.svg",
  },
  purpose: {
    solarPanels: B + "assets/lifecycle-media/purpose/solar-panels.webp",
    icons: {
      solar: B + "assets/lifecycle-media/icons/solar-network.svg",
      wind: B + "assets/lifecycle-media/icons/wind-integration.svg",
      analytics: B + "assets/lifecycle-media/icons/sensor-analytics.svg",
    },
  },
  featureCards: {
    icons: {
      processFlow: B + "assets/lifecycle-media/icons/process-flow.svg",
      stackedLayers: B + "assets/lifecycle-media/icons/stacked-layers.svg",
      branchingNodes: B + "assets/lifecycle-media/icons/branching-nodes.svg",
      moneyFlow: B + "assets/lifecycle-media/icons/money-flow.svg",
    },
  },
  services: {
    video: B + "assets/lifecycle-media/services/services-video.mp4",
    poster: B + "assets/lifecycle-media/services/services-poster.jpg",
  },
  customerStories: {
    shippingContainers: B + "assets/lifecycle-media/customer-stories/shipping-containers.webp",
    evCharging: B + "assets/lifecycle-media/customer-stories/ev-charging.webp",
    solarFarm: B + "assets/lifecycle-media/customer-stories/solar-farm.webp",
  },
  cinematic: {
    windTurbine: B + "assets/lifecycle-media/cinematic/wind-turbine-farmland.webp",
  },
  resources: {
    industrialBuilding: B + "assets/lifecycle-media/resources/industrial-building.png",
    agriculturalTeam: B + "assets/lifecycle-media/resources/agricultural-team.webp",
    shippingPort: B + "assets/lifecycle-media/resources/shipping-port.webp",
  },
  icons: {
    arrowUpRight: B + "assets/lifecycle-media/icons/arrow-up-right.svg",
  },
  logos: {
    wordmark: B + "assets/lifecycle-media/logos/lifecycle-wordmark.svg",
    partners: [
      B + "assets/lifecycle-media/logos/partner-1.svg",
      B + "assets/lifecycle-media/logos/partner-2.svg",
      B + "assets/lifecycle-media/logos/partner-3.svg",
      B + "assets/lifecycle-media/logos/partner-4.svg",
      B + "assets/lifecycle-media/logos/partner-5.svg",
      B + "assets/lifecycle-media/logos/partner-6.svg",
    ],
  },
};
