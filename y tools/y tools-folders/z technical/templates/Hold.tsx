


function NewDatesTable({habitsLogs, habits, deleteHabit, toggleHabit}) {
  function parseDate(dateObj) {
    const year = dateObj.getUTCFullYear();
    const month = dateObj.getUTCMonth() + 1; // months from 1-12
    const day = dateObj.getUTCDate();
    const pMonth = month.toString().padStart(2,"0");
    const pDay = day.toString().padStart(2,"0");
    const date = `d${year}_${pMonth}_${pDay}`;

    return date;
  }
  try {
    var currentDate = new Date()  
    var newDate = new Date()
    var parsedDatesArr = []
    var tableRows = []
    var tableRowsInner = []
    var colTitles = []
    var data = null
    colTitles.push(<th>Habits</th>)

    for (let i = 1; i <= 7; i++) {

        newDate.setDate(currentDate.getDate() - i)
        var parsedDate = (parseDate(newDate)).toString()
        parsedDatesArr.push(parsedDate)
        colTitles.push(<th>{parsedDate}</th>)
    }

    habits.map((habit, count) => {
        tableRowsInner.push(<td>{habit.title}</td>)
        
        for (let i = 1; i <= 7; i++) {
            var day = parsedDatesArr[i - 1]
            data = habitsLogs[count][day]
            var stringData = data.toString()

            tableRowsInner.push(<td><input
                    type="checkbox"
                    className='accent-black'
                    onChange={() => {toggleHabit(habit, day)}}
                    checked={data}>
                </input></td>)
        }
        tableRows.push(<tr key={habit.id}>{tableRowsInner}</tr>)
        tableRowsInner = []
    })

    return (
        <div className='border-2 border-none rounded-none border-black dark:border-white'>
            <table>
                <thead>
                    <tr>
                        {colTitles}
                        <th className=''></th>
                    </tr>
                </thead>
                <tbody>
                    {tableRows}
                </tbody>
            </table>
        </div>
    )
  } catch (error) {

    return (<p>Table Loading...</p>)
}}