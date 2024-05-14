import { useState, useEffect } from "react";
// import axios from "axios";
import React from "react";
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
  return (
    <div>
      {filteredPerson.map((person) => {
        return (
          <Names key={person.id} person={person} deleteName={deleteName} />
        );
      })}
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
  const [filteredPerson, setFilteredPeron] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    nameService
      .getAll()
      .then((initialPerson) => {
        console.log(res);
        setPersons(initialPerson);
        setFilteredPeron(initialPerson);
      })
      .catch((err) => {
        console.error("Error fetching data");
      });
  }, []);
  const addName = (event) => {
    event.preventDefault();
    console.log(event.target);

    const nameExists = persons.some((person) => person.name === newName);

    if (nameExists) {
      alert(`${newName} is already added to phonebook`);
      setNewName("");
      return;
    }
    const nameObject = {
      // id: persons.length + 1,
      name: newName,
      number: newNumber,
    };

    nameService.create(nameObject).then((returnedPerson) => {
      setPersons(persons.concat(returnedPerson));
      setFilteredPeron(filteredPerson.concat(returnedPerson));
      setMessage(`Added ${returnedPerson}`);
      setTimeout(() => {
        setMessage(null);
      }, 5000);
      setNewName("");
      setNewNumber("");
    });
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
        setFilteredPeron(filteredPerson.filter((person) => person.id !== id));
      })
      .catch((err) => {
        console.error("Error deleting person", error.message);
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
    setFilteredPeron(filterItems);
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
