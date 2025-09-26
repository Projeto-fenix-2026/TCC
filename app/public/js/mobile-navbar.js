class MobileNavbar {
  constructor(mobileMenu, navList, navLiks) {
    this.mobileMenu = document.querySelector(mobileMenu);
    this.navList = document.querySelector(navList);
    this.navLiks = document.querySelectorAll(navList);
    this.activeClass = "active";

    this.handleClick = this.handleClick.bind(this);


  }

  animateLinks() {
    this.navLiks.forEach((link, index) => {
      link.style.animation
      ? (link.style.animation = "")
      : (link.style.animation = `navLinkFade 0.2s ease forwards
       ${index / 7 + 0.1}s`);
    });
  }



  handleClick() {
    this.navList.classList.toggle(this.activeClass)
    this.mobileMenu.classList.toggle(this.activeClass);
    this.animateLinks();
  }

  addClickEvent() {
    this.mobileMenu.addEventListener("click", this.handleClick);
   
  }
  init() {
    if(this.mobileMenu) {
      this.addClickEvent();
    }
    return this;
  }
}

const mobileNavbar = new MobileNavbar(
  ".mobile-menu",
  ".nav-list",
  ".nav-list li",


);
mobileNavbar.init();

