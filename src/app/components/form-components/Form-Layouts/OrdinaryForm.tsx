import { Label, TextInput, Checkbox, Button, HelperText } from "flowbite-react";
import React from "react";
import TitleCard from "../../shared/TitleBorderCard";

const OrdinaryForm = () => {
  return (
    <div>
      <TitleCard title="Ordrinary Form">
        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-12">
            <div className="mb-2 block">
              <Label htmlFor="email1">Email</Label>
            </div>
            <TextInput className="form-control"
              id="email3"
              type="email"
              placeholder="name@materialm.com"
              required
            />
            <HelperText>
              <>
                  We’ll never share your details. Read our
                  <a
                    href="#"
                    className="ml-1 font-medium text-primary hover:underline dark:text-primary"
                  >
                    Privacy Policy
                  </a>
                  .
                </>
            </HelperText>
          </div>
          <div className="col-span-12">
            <div className="mb-2 block">
              <Label htmlFor="password1">Password</Label>
            </div>
            <TextInput className="form-control"
              id="password1"
              type="password"
              required
            />
          </div>
          <div className="flex items-center gap-2 col-span-12">
            <Checkbox className="checkbox" id="remember" />
            <Label htmlFor="remember">RememberMe!</Label>
          </div>
          <div className="col-span-12">
            <Button type="submit" color="primary">
              Submit
            </Button>
          </div>
        </div>
      </TitleCard>
    </div>
  );
};

export default OrdinaryForm;
