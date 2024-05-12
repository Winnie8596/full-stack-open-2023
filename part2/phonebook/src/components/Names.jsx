export const Names = ({ person, deleteName }) => {
  return (
    <div>
      {person.name} {person.number}{" "}
      <buttonon onClick={() => deleteName(person.id, person.name)}>
        delete
      </buttonon>
    </div>
  );
};
