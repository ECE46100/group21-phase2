import React from "react";
import '@testing-library/jest-dom'
import {render, screen} from '@testing-library/react'
import { Dummy } from "./dummy";

test('render name', ()=>{
    render(<Dummy name="LLLLL" />);
    const name = screen.getByText(/Name is LLLLL/i);
    expect(name).toBeInTheDocument();
})