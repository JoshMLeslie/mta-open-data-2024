declare namespace L {
	namespace Control {
		interface TextBoxOptions extends ControlOptions {}
		class TextBox extends Control {
			constructor(options?: TextBoxOptions);
			options: TextBoxOptions;
			updateText: (text: string) => void;
		}
	}
}
