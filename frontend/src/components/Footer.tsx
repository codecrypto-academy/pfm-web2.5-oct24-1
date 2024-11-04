import React from 'react';

interface Link {
  text: string;
  url: string;
}

interface FooterSection {
  title: string;
  links: Link[];
}

export const Footer: React.FC = () => {
  const footerSections: FooterSection[] = [
    {
      title: 'Usefull links',
      links: [
        { text: 'Link 1', url: '#' },
        { text: 'Link 2', url: '#' },
      ]
    },
    {
      title: 'Contact',
      links: [
        { text: 'Link 4', url: '#' },
        { text: 'Link 5', url: '#' },
      ]
    },
    {
      title: 'RRSS',
      links: [
        { text: 'Link 7', url: '#' },
        { text: 'Link 8', url: '#' },
      ]
    }
  ];

  return (
    <footer className="d-flex justify-content-between bg-dark text-white p-4 position-fixed bottom-0 w-100">
      {footerSections.map((section, index) => (
        <div
          key={index}
          className={`d-flex flex-column ${
            index === 0 ? 'ms-3' : index === footerSections.length - 1 ? 'me-3 text-end' : 'text-center'
          }`}
        >
          <h5 className="mb-2">{section.title}</h5>
          {section.links.map((link, linkIndex) => (
            <a key={linkIndex} href={link.url} className="text-white text-decoration-none mb-1">
              {link.text}
            </a>
          ))}
        </div>
      ))}
    </footer>
  );
};
