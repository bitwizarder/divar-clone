import React from "react";

function Footer() {
  return (
    <footer className="flex-center">
      <section className="flex-center border-t border-gray-300 py-8 space-x-1 w-5/6 lg:w-1/2">
        <div>
          <a href="#">
            <i className="fa fab fa-youtube-square text-2xl text-gray"></i>
          </a>
        </div>
        <div>
          <a href="#">
            <i className="fa fa-linkedin-square text-2xl text-gray"></i>
          </a>
        </div>
        <div>
          <a href="#">
            <i className="fa fab fa-twitter-square text-2xl text-gray"></i>
          </a>
        </div>
        <div>
          <a href="#">
            <i className="fa fa-instagram text-2xl text-gray"></i>
          </a>
        </div>
      </section>
    </footer>
  );
}

export default Footer;
