import {ToggleButton} from "SpectaclesInteractionKit/Components/UI/ToggleButton/ToggleButton"

@component
export class NewScript extends BaseScriptComponent {
    
    
@input
targetObject: SceneObject;

    
//    
//      @input
//  @hint('The script containing functions to be called on toggle state change')
//  toggle: ToggleButton;
    
    onAwake() {
        
    }
    
    
    onToggle() {
//        var groupName = "Happy";

    this.targetObject.enabled = !this.targetObject.enabled; // Toggle the enabled state

    }
}
