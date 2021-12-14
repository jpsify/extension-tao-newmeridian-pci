
	<responseCondition>
		<responseIf>
			<match>
				<variable identifier="{{target}}" />
				<baseValue baseType="float">{{targetValue}}</baseValue>
			</match>
			<setOutcomeValue identifier="SCORE">
				<sum>
					<variable identifier="SCORE" />
					<baseValue baseType="float">{{score}}</baseValue>
				</sum>
			</setOutcomeValue>
		</responseIf>
	</responseCondition>
	