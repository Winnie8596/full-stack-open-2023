import { useState, useEffect } from "react";
import { Names } from "./components/Names";
import nameService from "./service/name";

const Filter = ({ searchPerson, handleSearchPerson }) => {
  return (
    <div>
      filter shown with:
      <input value={searchPerson} onChange={handleSearchPerson} />
    </div>
  );
};

const PersonForm = ({
  addName,
  newName,
  handleNameChange,
  newNumber,
  handleNumberChange,
}) => {
  return (
    <form onSubmit={addName}>
      <div>
        name: <input value={newName} onChange={handleNameChange} />
      </div>
      <div>
        number: <input value={newNumber} onChange={handleNumberChange} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  );
};

const Person = ({ filteredPerson, deleteName }) => {
  if (!filteredPerson || !Array.isArray(filteredPerson)) {
    return null; // or any fallback UI, depending on your requirements
  }

  return (
    <div>
      {filteredPerson.map((person) => (
        <Names key={person.id} person={person} deleteName={deleteName} />
      ))}
    </div>
  );
};

const Notification = ({ message }) => {
  if (message === null) {
    return null;
  }
  return <div className="message">{message}</div>;
};

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [searchPerson, setSearchPerson] = useState("");
  const [filteredPerson, setFilteredPerson] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    nameService
      .getAll()
      .then((initialPerson) => {
        setPersons(initialPerson);
        setFilteredPerson(initialPerson);
      })
      .catch((error) => {
        console.error("Error fetching data", error.message);
      });
  }, []);

  const addName = (event) => {
    event.preventDefault();

    // Validate inputs
    if (!newName || !newNumber) {
      setMessage("Name and number cannot be empty");
      setTimeout(() => {
        setMessage(null);
      }, 5000);
      return;
    }

    const nameExists = Array.isArray(persons)
      ? persons.find(
          (person) => person.name.toLowerCase() === newName.toLowerCase()
        )
      : null;

    const nameObject = {
      name: newName,
      number: newNumber,
    };

    console.log("Creating person with object:", nameObject); // Log nameObject

    if (nameExists) {
      const confirmed = window.confirm(
        `${nameExists.name} is already added to phonebook. Replace the old number with a new one?`
      );

      if (!confirmed) {
        return;
      }

      // Update existing person
      nameService
        .update(nameExists.id, nameObject)
        .then((updatedPerson) => {
          setPersons((prevPersons) =>
            prevPersons.map((person) =>
              person.id === updatedPerson.id ? updatedPerson : person
            )
          );
          setFilteredPerson((prevFilteredPersons) =>
            prevFilteredPersons.map((person) =>
              person.id === updatedPerson.id ? updatedPerson : person
            )
          );
          setMessage(`Updated ${updatedPerson.name}'s number`);
          setTimeout(() => {
            setMessage(null);
          }, 5000);
        })
        .catch((error) => {
          console.error("Error updating number:", error.message);
          setMessage(`Error: ${error.message}`);
          setTimeout(() => {
            setMessage(null);
          }, 5000);
        });
    } else {
      // Add new person
      nameService
        .create(nameObject)
        .then((returnedPerson) => {
          setPersons([...persons, returnedPerson]);
          setFilteredPerson([...filteredPerson, returnedPerson]);
          setMessage(`Added ${returnedPerson.name}`);
          setTimeout(() => {
            setMessage(null);
          }, 5000);
        })
        .catch((error) => {
          console.error(
            "Error creating person:",
            error.response?.data || error.message
          );
          setMessage(`Error: ${error.response?.data?.error || error.message}`);
          setTimeout(() => {
            setMessage(null);
          }, 5000);
        });
    }

    // Reset input fields after submission
    setNewName("");
    setNewNumber("");
  };

  const deleteName = (id, name) => {
    const confirmDelete = window.confirm(`Delete ${name} ?`);
    if (!confirmDelete) {
      return;
    }
    nameService
      .remove(id)
      .then(() => {
        setPersons(persons.filter((person) => person.id !== id));
        setFilteredPerson(filteredPerson.filter((person) => person.id !== id));
      })
      .catch((err) => {
        console.error("Error deleting person", err.message);
        alert("Error deleting person");
      });
  };

  const handleNameChange = (e) => {
    setNewName(e.target.value);
  };

  const handleNumberChange = (e) => {
    setNewNumber(e.target.value);
  };

  const handleSearchPerson = (e) => {
    setSearchPerson(e.target.value);

    const filterItems = persons.filter((person) =>
      person.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredPerson(filterItems);
  };

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} />
      <Filter
        searchPerson={searchPerson}
        handleSearchPerson={handleSearchPerson}
      />
      <h3>Add a new</h3>

      <PersonForm
        addName={addName}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />
      <h3>Numbers</h3>
      <Person filteredPerson={filteredPerson} deleteName={deleteName} />
    </div>
  );
};

export default App;
