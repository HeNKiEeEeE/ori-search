import { Property, register } from "link-redux";
import React from "react";

import { NS } from "../../LRS";
import { resourceTopology } from "../Topologies/ResourceTopology";
import Box from "../Topologies/BoxTopology";
import { labelsTopology } from "../Topologies/LabelsTopology";

const ThingResource = () => {
  return (
    <Box>
      <Property label={[NS.schema("name"), NS.schema("label")]} />
    </Box>
  );
};

ThingResource.type = NS.schema("Thing");
ThingResource.topology = [resourceTopology, labelsTopology];

export default register(ThingResource);