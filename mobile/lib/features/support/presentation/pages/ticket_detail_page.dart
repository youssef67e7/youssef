import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pharmaworld/shared/widgets/custom_button.dart';

class TicketDetailPage extends ConsumerStatefulWidget {
  const TicketDetailPage({super.key, required this.ticketId});
  final String ticketId;

  @override
  ConsumerState<TicketDetailPage> createState() => _TicketDetailPageState();
}

class _TicketDetailPageState extends ConsumerState<TicketDetailPage> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  bool _sending = false;

  final _messages = [
    {'text': 'I have an issue with my recent order. The medicine arrived damaged.', 'isMe': true, 'time': '10:30 AM'},
    {'text': 'Hello! We are sorry to hear that. Can you please provide your order number?', 'isMe': false, 'time': '10:32 AM'},
    {'text': 'Yes, my order number is ORD-2024-7890.', 'isMe': true, 'time': '10:35 AM'},
    {'text': 'Thank you. We have checked your order and initiated a return. Our delivery partner will pick up the damaged item within 24 hours and a replacement will be sent.', 'isMe': false, 'time': '10:40 AM'},
    {'text': 'Thank you for the quick response!', 'isMe': true, 'time': '10:42 AM'},
    {'text': 'You are welcome! We will notify you when the replacement is out for delivery. Is there anything else we can help with?', 'isMe': false, 'time': '10:43 AM'},
  ];

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    if (_messageController.text.trim().isEmpty) return;
    setState(() => _sending = true);
    Future.delayed(const Duration(milliseconds: 500), () {
      if (!mounted) return;
      setState(() {
        _messages.add({'text': _messageController.text.trim(), 'isMe': true, 'time': 'Just now'});
        _messageController.clear();
        _sending = false;
      });
      Future.delayed(const Duration(milliseconds: 600), () {
        if (_scrollController.hasClients) {
          _scrollController.animateTo(_scrollController.position.maxScrollExtent, duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
        }
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Ticket #${widget.ticketId}', style: theme.textTheme.titleSmall),
            Text('Support', style: theme.textTheme.bodySmall?.copyWith(color: Colors.grey)),
          ],
        ),
        actions: [
          Center(
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                borderRadius: BorderRadius.circular(12.r),
              ),
              child: Text('Open', style: theme.textTheme.bodySmall?.copyWith(color: Colors.green)),
            ),
          ),
          SizedBox(width: 8.w),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: EdgeInsets.all(12.r),
            color: theme.colorScheme.surfaceContainerHighest,
            child: Row(
              children: [
                Icon(Icons.info_outline, size: 16.r, color: theme.colorScheme.primary),
                SizedBox(width: 8.w),
                Expanded(child: Text('Order #ORD-2024-7890 - Damaged Item', style: theme.textTheme.bodySmall)),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: EdgeInsets.all(16.r),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isMe = msg['isMe'] as bool;
                return Padding(
                  padding: EdgeInsets.only(bottom: 12.h),
                  child: Row(
                    mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (!isMe) ...[
                        CircleAvatar(
                          radius: 16.r,
                          child: Icon(Icons.support_agent, size: 16.r),
                        ),
                        SizedBox(width: 8.w),
                      ],
                      Flexible(
                        child: Container(
                          constraints: BoxConstraints(maxWidth: 280.w),
                          padding: EdgeInsets.all(12.r),
                          decoration: BoxDecoration(
                            color: isMe ? theme.colorScheme.primary : theme.colorScheme.surfaceContainerHighest,
                            borderRadius: BorderRadius.only(
                              topLeft: Radius.circular(16.r),
                              topRight: Radius.circular(16.r),
                              bottomLeft: Radius.circular(isMe ? 16.r : 4.r),
                              bottomRight: Radius.circular(isMe ? 4.r : 16.r),
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                msg['text'] as String,
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: isMe ? Colors.white : null,
                                ),
                              ),
                              SizedBox(height: 4.h),
                              Text(
                                msg['time'] as String,
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: isMe ? Colors.white.withOpacity(0.7) : Colors.grey,
                                  fontSize: 10.sp,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      if (isMe) SizedBox(width: 8.w),
                    ],
                  ),
                );
              },
            ),
          ),
          Container(
            padding: EdgeInsets.all(16.r),
            decoration: BoxDecoration(
              color: theme.colorScheme.surface,
              border: Border(top: BorderSide(color: theme.dividerColor)),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      decoration: InputDecoration(
                        hintText: 'Type a message...',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(24.r)),
                        contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 10.h),
                        filled: true,
                        fillColor: theme.colorScheme.surfaceContainerHighest,
                      ),
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  SizedBox(width: 8.w),
                  SizedBox(
                    width: 44.r,
                    height: 44.r,
                    child: ElevatedButton(
                      onPressed: _sending ? null : _sendMessage,
                      style: ElevatedButton.styleFrom(
                        padding: EdgeInsets.zero,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22.r)),
                      ),
                      child: _sending
                          ? SizedBox(width: 20.r, height: 20.r, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : Icon(Icons.send_rounded, color: Colors.white),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
