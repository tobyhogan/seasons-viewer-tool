import React from 'react';

class DataTable extends React.Component {




  render() {

    const {habitsLogs:data, habits, deleteHabit, toggleHabit}  = this.props;

    function parseDate(dateObj) {

      const year = dateObj.getUTCFullYear();
      const month = dateObj.getUTCMonth() + 1; // months from 1-12
      const day = dateObj.getUTCDate();

      const pMonth = month.toString().padStart(2,"0");
      const pDay = day.toString().padStart(2,"0");

      const date = `d${year}-${pMonth}-${pDay}`;

      return date;

    }

    try {

      var currentDate = new Date()  
      var newDate = new Date()


      for (let i = 1; i <= 6; i++) {

        //console.log(i)

        newDate.setDate(currentDate.getDate() - i)

        //console.log(newDate)
        //console.log(parseDate(newDate))


      }

      const tableRows = data.map((habitsLog) => (

        <tr key={habitsLog.id} className=''>
          <td>{habits.find(x => x.id === habitsLog.id).title}</td>
          <td><input type="checkbox" className='accent-black' onChange={() => {toggleHabit(habits.find(x => x.id === habitsLog.id), 'd09_04_24')}} checked={habitsLog.d09_04_24}></input></td>
          <td><input type="checkbox" className='accent-black' onChange={() => {toggleHabit(habits.find(x => x.id === habitsLog.id), 'd08_04_24')}} checked={habitsLog.d08_04_24}></input></td>
          <td><input type="checkbox" className='accent-black' onChange={() => {toggleHabit(habits.find(x => x.id === habitsLog.id), 'd07_04_24')}} checked={habitsLog.d07_04_24}></input></td>
          <td><input type="checkbox" className='accent-black' onChange={() => {toggleHabit(habits.find(x => x.id === habitsLog.id), 'd06_04_24')}} checked={habitsLog.d06_04_24}></input></td>
          <td><input type="checkbox" className='accent-black' onChange={() => {toggleHabit(habits.find(x => x.id === habitsLog.id), 'd05_04_24')}} checked={habitsLog.d05_04_24}></input></td>
          <td><input type="checkbox" className='accent-black' onChange={() => {toggleHabit(habits.find(x => x.id === habitsLog.id), 'd04_04_24')}} checked={habitsLog.d04_04_24}></input></td>
          <td><input type="checkbox" className='accent-black' onChange={() => {toggleHabit(habits.find(x => x.id === habitsLog.id), 'd03_04_24')}} checked={habitsLog.d03_04_24}></input></td>
          <td><input type="checkbox" className='accent-black' onChange={() => {toggleHabit(habits.find(x => x.id === habitsLog.id), 'd02_04_24')}} checked={habitsLog.d02_04_24}></input></td>
          <td className='border-y-white'><button className='border-none'><i className="material-icons" onClick={() => {deleteHabit(habitsLog.id)}}>delete</i></button></td>
        </tr>
      ));

      return (
        <div className='border-2 border-none rounded-none'>
          <table className='border-black border-2 mt-2'>
            <thead className=''>
              <tr className=''>
                <th>Habit</th>
                <th>09/04</th>
                <th>08/04</th>
                <th>07/04</th>
                <th>06/04</th>
                <th>05/04</th>
                <th>04/04</th>
                <th>03/04</th>
                <th>02/04</th>
                <th className=''></th>
              </tr>
            </thead>
            <tbody>
              {tableRows}
            </tbody>
          </table>
        </div>
      );
      
     
    } catch (error) {

      return (<p>Table Loading...</p>)

    }
  }
}

export default DataTable;