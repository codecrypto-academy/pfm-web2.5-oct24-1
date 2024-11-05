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
    <footer className="d-flex justify-content-between text-white p-4 position-relative bottom-0 w-100">
      {footerSections.map((section, index) => (
        <div
          key={index}
          className={`d-flex flex-column ${
            index === 0 ? 'ms-3' : index === footerSections.length - 1 ? 'me-3 text-end' : 'text-center'
          }`}
        >
          <p className="mb-2 text-secondary">{section.title}</p>
          {section.links.map((link, linkIndex) => (
            <a key={linkIndex} href={link.url} className="text-secondary text-decoration-none mb-1">
              {link.text}
            </a>
          ))}
        </div>
      ))}
    </footer>
  );
};
