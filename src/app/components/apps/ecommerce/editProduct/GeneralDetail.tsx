"use client";
import CardBox from "@/app/components/shared/CardBox";
import { Label, TextInput } from "flowbite-react";
import React, { useState } from "react";
import TiptapEdit from "../editor/TiptapEdit";


const GeneralDetail = () => {
  const [text, setText] = useState("");
  return (
    <>
      <CardBox>
        <h5 className="card-title mb-4">General</h5>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="prednm">Product Name</Label>
            <span className="text-error ms-1">*</span>
          </div>
          <TextInput
            id="prednm"
            type="text"
            sizing="md"
            className="form-control"
            placeholder="Product Name"
            value="Super Games"
          />
          <small className="text-xs text-darklink dark:text-bodytext">
            A product name is required and recommended to be unique.
          </small>
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="desc">Description</Label>
          </div>
           <TiptapEdit/>
          <small className="text-xs text-darklink dark:text-bodytext">
            Set a description to the product for better visibility.
          </small>
        </div>
      </CardBox>
    </>
  );
};

export default GeneralDetail;
