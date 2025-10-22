import React from "react";
import { InformationCircleIcon } from "@heroicons/react/20/solid";

const InfoPanel = () => {
  return (
    <div className="rounded-md bg-blue-50 p-4 mb-5">
      <div className="flex">
        <div className="shrink-0">
          <InformationCircleIcon
            aria-hidden="true"
            className="size-5 text-blue-400"
          />
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <p className="text-sm text-blue-700">
            - listbin is a tool that can help you figure out the rules behind
            text format Warhammer 40k army lists
            <br />
            - listbin currently only supports parsing of lists in GW format.
            <br />- Every list that you parse will be stored locally to your
            device, but you can also share them with others. This will create a
            permanent link to the list.
          </p>
          <p className="mt-3 text-sm md:mt-0 md:ml-6">
            <a
              href="https://listbin.app/shared/0s6gbcpq/"
              className="font-medium whitespace-nowrap text-blue-700 hover:text-blue-600"
            >
              View Example
              <span aria-hidden="true"> &rarr;</span>
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
