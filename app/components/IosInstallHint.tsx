"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";

// The install steps for iPhone and iPad, which have no install dialog to open. Its own
// file so that only iPhones and iPads download the popover (InstallButton loads it).
const IosInstallHint: React.FC<{ trigger: React.ReactElement }> = ({
  trigger,
}) => (
  <Popover placement="bottom-start">
    <PopoverTrigger>{trigger}</PopoverTrigger>
    <PopoverContent>
      <div className="max-w-xs px-2 py-3 text-small">
        <p className="mb-2 font-bold">Ana ekrana eklemek için</p>
        <ol className="list-decimal pl-5">
          <li>
            Safari&apos;de <span className="font-bold">Paylaş</span> simgesine
            (yukarı oklu kare) dokunun.
          </li>
          <li>
            <span className="font-bold">Ana Ekrana Ekle</span>&apos;yi seçin.
          </li>
        </ol>
      </div>
    </PopoverContent>
  </Popover>
);

export default IosInstallHint;
