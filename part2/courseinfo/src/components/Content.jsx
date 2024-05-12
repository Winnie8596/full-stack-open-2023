import Part from "./Part";

const Content = ({parts}) => {
  const sumExercises = parts.reduce((total,part)=>total+part.exercises,0)
  return (
    <div>
      {
        parts.map((part)=>(
          <Part part={part} key={part.name}/>
        ))
      }
      <div>
        <b> total of {sumExercises} exercises</b>
      </div>
    </div>
  );
};

export default Content;
