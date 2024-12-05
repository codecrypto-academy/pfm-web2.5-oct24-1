import React from 'react';
import { Linkedin } from 'lucide-react';

// Definición de interfaz para el miembro del equipo
interface TeamMember {
    id: number;
    name: string;
    role: string;
    experience: string;
    photo: string;
    linkedin: string;
  }
  
  // Definición de interfaz para las props del componente
  interface TeamMemberCardProps {
    member: TeamMember;
  }
 

const teamMembers:  TeamMember[] = [
    {
      id: 1,
      name: "Alfredo Delgado",
      role: "Software Engineer & Blockchain Developer",
      experience: "The blockchain messenger",
      photo: "src/assets/team-members/alfredo_img.jpg", 
      linkedin: "https://www.linkedin.com/in/aadelgadolop/"
    },
    {
      id: 2,
      name: "Orlando Hernandez",
      role: "Blockchain Developer and Doctor",
      experience: "Medical expert in a blockchain world",
      photo: "src/assets/team-members/orlando_img.jpg",
      linkedin: "https://www.linkedin.com/in/orlando-hernandez-celli-blockchain-developer/"
    },
    {
        id: 3,
        name: "Paulo Guachizaca",
        role: "Senior Web and Blockchain Developer",
        experience: "Web ninja & AI samurai",
        photo: "src/assets/team-members/paulo_img.jpg",
        linkedin: "https://www.linkedin.com/in/paulo-guachizaca/"
      }
];

const TeamMemberCard:React.FC<TeamMemberCardProps>  = ({ member }) => {
    return (
      <div className="card h-100 shadow-sm">
        <div className="card-body text-center">
          <img 
            src={member.photo} 
            alt={member.name} 
            className="rounded-circle mb-3 mx-auto"
          />
          <h5 className="card-title">{member.name}</h5>
          <p className="card-text text-muted">{member.role}</p>
          <p className="card-text">
            <small className="text-muted">{member.experience}</small>
          </p>
          <a 
            href={member.linkedin} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-outline-primary d-flex align-items-center justify-content-center"
          >
            <Linkedin className="me-2" /> LinkedIn profile
          </a>
        </div>
      </div>
    );
};

export const TeamMembers:React.FC = () => {
    return (
        <div className="container py-5">
          <h1 className="text-center mb-5">Our expert team members</h1>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {teamMembers.map(member => (
              <div key={member.id} className="col">
                <TeamMemberCard member={member} />
              </div>
            ))}
          </div>
        </div>
      );
}


