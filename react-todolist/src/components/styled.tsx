import styled from "styled-components";

const ButtonBase = styled.button`
  background-clip: border-box;
  cursor: pointer;
  display: inline-block;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 20px;
  line-height: 1.5;
  border-radius: 0.25rem;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out;
  color: #fff;
  &:hover {
    color: #000;
  }
`;

// 蓝色按钮
const PrimaryButton = styled(ButtonBase)`
  background-color: #007bff;
  padding: 10px 30px;
  &:hover {
    background-color: #0069d9;
    border-color: #0062cc;
  }
`;

// 删除按钮
const DeleteButton = styled(ButtonBase)<{ hover?: boolean }>`
  ${(props) => !props.hover && `visibility: hidden;`};
  background-color: transparent;
  color: #000;
  transition: transform 0.3s ease;
  font-size: 26px;
  &:hover {
    transform: rotate(180deg);
  }
`;

export const Button = {
  primary: PrimaryButton,
  delete: DeleteButton,
};
