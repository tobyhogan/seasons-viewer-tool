import { useDisclosure } from '@mantine/hooks';
import { Modal as MantineModal, Menu as MantineMenu } from '@mantine/core';
import React, { useEffect } from 'react';


import { MdEdit, MdDelete, MdArchive, MdUnarchive, MdMoreVert, MdAdd } from "react-icons/md";

import '../styles/App.css'
import '../dist/output.css'



export function NewHabitModal({children, content, buttonClasses, title}: any) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <MantineModal className='Modal2' opened={opened} onClose={close} title={title} overlayProps={{backgroundOpacity:0.2}} yOffset="15dvh">
        {content}
      </MantineModal>
      <button className={'border-none text-grayNew-700 bg-grayNew-175 dark:text-gray-300 dark:bg-grayNew-650 dark:hover:bg-grayNew-600' + buttonClasses}  onClick={open} title='Add New Habit'>{children}</button>
    </>
  );
}


export function HabitOptionsModal({habit, deleteHabit, renameHabit, toggleArchive}: any) {
  const [opened, { open, close }] = useDisclosure(false);


  const handleSave = () => {

    var input = (document.getElementById("HTitleInput") as HTMLInputElement)

    renameHabit(habit, input.value)

    close()

  }


  return (
    <>
      <MantineModal className='Modal2' opened={opened} onClose={close} title="Edit Habit" overlayProps={{backgroundOpacity:0.2}} yOffset="15dvh">
        <div className='flex flex-col mx-auto mb-3'>
          <div className="text-white w-fit  [&>button]:border-none">
            <button onClick={() => {deleteHabit(habit.id)}}><MdDelete size={22} className='text-black dark:text-white'/></button>
            <button onClick={() => {toggleArchive(habit)}} className="ml-3"><MdArchive size={22} className='text-black dark:text-white'/></button>
          </div>
          <h2 className="dark:text-white mx-auto mb-2 pl-3">Habit:</h2>
          <div className="flex mx-auto mt-2 pl-4">
            <input id="HTitleInput" type="text" defaultValue={habit.title} autoComplete="off" className="Input1 w-fit rounded-sm"/>       
          </div>

          {/*
          
          <h2 className="dark:text-white mx-auto mb-2 pl-3 mt-5">Color Tag:</h2>
          <div className="flex mx-auto mt-2 pl-4">
          <select name='groups' className='rounded-sm dark:text-white dark:bg-grayNew-800 dark:border-1 border-black'>
              <option value="">None</option>
              <option value=""><div className='w-4 h-4 bg-white'></div>White</option>
              <option value=""><div className='w-4 h-4 bg-red-600'></div>Red</option>
            </select>
          </div>

          <h2 className="dark:text-white mx-auto mb-2 pl-3 mt-5">In Group:</h2>
          <div className="flex mx-auto mt-2 pl-4">
            <select name='groups' className='rounded-sm dark:text-white dark:bg-grayNew-800 dark:border-1 border-black'>
              <option value="">No Group</option>
              <option value="">Group123</option>
              <option value="">Group456</option>
            </select>
          </div>
          */}
  
        <div className="flex mx-auto mt-16 dark:text-white [&>button]:px-2">
          <button onClick={close} className=''>Cancel</button>
          <button onClick={handleSave} className="ml-3 dark:bg-grayNew-550">Save</button>
        </div>
        </div>
      </MantineModal>
      <button className="border-none dark:bg-grayNew-800 rounded-sm"  onClick={open}>

          <MdMoreVert size={22} className="pt-0.5 -my-0.5"/>

      </button>
    </>
  );
}



export function Dropdown({trigger, content}: any) {


  return (
    <>
      <MantineMenu>
        <MantineMenu.Target>
          {trigger}
        </MantineMenu.Target>
        <MantineMenu.Dropdown>
          {content}
        </MantineMenu.Dropdown>
      </MantineMenu>
    </>
  );
}

