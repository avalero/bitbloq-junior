import React, { FC } from "react";
import styled from "@emotion/styled";
import { useRecoilValue } from "recoil";
import { draggingInstanceState } from "./state";
import useHardwareDefinition from "./useHardwareDefinition";

const DraggingComponent: FC = () => {
  const { getComponent } = useHardwareDefinition();
  const instance = useRecoilValue(draggingInstanceState);
  const component = instance && getComponent(instance.component);

  if (!component) {
    return null;
  }

  return (
    <Container left={instance.x} top={instance.y}>
      <img
        src={component.image.url}
        width={component.image.width}
        height={component.image.height}
        alt={component.label}
      />
    </Container>
  );
};

export default DraggingComponent;

const Container = styled.div<{ top: number; left: number }>`
  position: fixed;
  top: ${props => props.top}px;
  left: ${props => props.left}px;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  background: #d7d7d7;
  border-radius: 4px;
  padding: 10px;

  img {
    margin: 10px;
    pointer-events: none;
  }
`;
