
	<responseCondition>
		<responseIf>
			<not>
				<isNull>
					<variable identifier="{{id}}" />
				</isNull>
			</not>
			<setOutcomeValue identifier="{{target}}">
				<sum>
					<variable identifier="{{target}}" />
					<mapResponse identifier="{{id}}" />
				</sum>
			</setOutcomeValue>
		</responseIf>
	</responseCondition>
