export interface Translations {
  nav: {
    marketplace: string
    login: string
    logout: string
    orders: string
    howItWorks: string
  }
  marketplace: {
    title: string
    noProducts: string
    filters: {
      all: string
      vegetables: string
      fruit: string
      eggs: string
      honey: string
      olive_oil: string
      legumes: string
      grains: string
      herbs: string
    }
  }
  listing: {
    veryFresh: string
    fresh: string
    consumeSoon: string
    recent: string
    harvested: string
  }
  order: {
    title: string
    status: string
    total: string
    date: string
    items: string
    pending: string
    confirmed: string
    inTransit: string
    delivered: string
    cancelled: string
    refunded: string
  }
  login: {
    title: string
    phoneNumber: string
    sendCode: string
    enterCode: string
    verify: string
    sending: string
    verifying: string
  }
}
