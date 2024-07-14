import {Switch} from "@nextui-org/switch";
/// https://nextui.org/docs/components/switch

const ToggleSwitch = (props) => {
  const { label, id } = props;
  return (
    <Switch color="default">{label}</Switch>
  );
};
 
export default ToggleSwitch;